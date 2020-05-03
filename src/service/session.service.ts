import { Session } from '../models/session.model';
import { User } from '../models/user.model';
import { Repository } from 'mongoize-orm';
import { MealSize } from '../common/helpers';
import { TimelineService } from '../microservices/blood-alcohol/timeline.service';
import { Drunkard } from '../models/drunkard.model';
import { Timeline } from '../microservices/blood-alcohol/timeline.model';

export type Projection = {
  time: number;
  bac: number;
  alreadyPassed?: boolean;
};

export type TimelineEvents = {
  startedDrinkingAt: Projection;
  currentState: Projection;
  mostDrunkAt: Projection;
  soberAt: Projection;
};

export class SessionService {
  static async createSessionOnSober(
    user: User,
    mealSize?: MealSize
  ): Promise<Session> {
    const session: Session = await Repository.with(Session).findOne({
      userId: user.toJson()._id,
      soberAt: { $gt: new Date() }
    });

    // no past sessions exist, the user has just created their account or is sober
    if (!session) {
      return new Session()
        .build({ userId: user.toJson()._id, mealSize })
        .save();
    }

    // otherwise return the active session
    return session;
  }

  // purges old timelines and regenerates the new timeline on an event happening
  static async onSessionEvent(sessionId: string): Promise<void> {
    // TODO need a .refresh method to update the instance after an operation elsewhere
    const session = await Repository.with(Session).findById(sessionId);
    const user = await Repository.with(User).findById(session.toJson().userId);
    const drunkard = new Drunkard(session, user);

    // first purge the old cache containing the last known timeline
    // TODO the global client is being overwritten when passing options!
    await Repository.with(Timeline).deleteMany(
      {
        sessionId: session.toJson()._id
      },
      { hard: true, client: global.databaseClient }
    );

    const timelineService: TimelineService = TimelineService.getInstance(
      drunkard
    );

    const series = await timelineService.buildTimeSeries(
      await session.events()
    );

    const timeline: Timeline = await new Timeline()
      .build({ sessionId: session.toJson()._id, series })
      .save();

    const events: TimelineEvents = await timelineService.estimateEventTimes(
      timeline.toJson().series
    );

    await SessionService.updateSessionCache(
      sessionId,
      new Date(events.soberAt.time)
    );
  }

  // fetches cached events from generated timeline
  static async fetchTimelineEvents(
    session: Session,
    user: User
  ): Promise<TimelineEvents> {
    const drunkard = new Drunkard(session, user);
    const timeline = await Repository.with(Timeline).findOne({
      sessionId: session.toJson()._id,
      deleted: false
    });

    if (!timeline) {
      throw new Error('Session does not have associated events');
    }

    return TimelineService.getInstance(drunkard).estimateEventTimes(
      timeline.toJson().series
    );
  }

  // only accessible internally as a facade for the microservice to use
  private static async updateSessionCache(
    sessionId: string,
    soberAt: Date
  ): Promise<void> {
    const session: Session = await Repository.with(Session).findById(sessionId);
    if (session) {
      // the user may delete their account and purge any session data between drinks
      await session.update({ soberAt });
    }
  }
}
