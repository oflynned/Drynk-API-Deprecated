import { Session } from '../models/session.model';
import { User } from '../models/user.model';
import { Repository } from 'mongoize-orm';
import { MealSize, Point } from '../common/helpers';
import { TimelineService } from '../microservices/blood-alcohol-timeline';
import { Drunkard } from '../models/drunkard.model';
import { Timeline } from '../microservices/blood-alcohol-timeline/timeline.model';

export type Projection = {
  time: number;
  bloodAlcoholContent: number;
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
    // find the latest session within the last 3 hours in case already sober
    const session: Session = await Session.findWithinLastHours(
      user.toJson()._id
    );
    if (session) {
      return session;
    }

    // no past sessions exist, the user has just created their account or is sober
    return new Session().build({ userId: user.toJson()._id, mealSize }).save();
  }

  // purges old timelines and regenerates the new timeline on an event happening
  static async onSessionEvent(session: Session): Promise<void> {
    const user = await Repository.with(User).findById(session.toJson().userId);
    const drunkard = new Drunkard(session, user);

    // first purge the old cache containing the last known timeline
    // we don't care about the old timelines, so we can hard delete them
    await Repository.with(Timeline).hardDeleteMany({
      sessionId: session.toJson()._id
    });

    const sessionEvents = await session.events();
    if (sessionEvents.length === 0) {
      // the last drink of the session may have been deleted, we should purge the timeline
      await session.hardDelete();
      return;
    }

    const timelineService: TimelineService = TimelineService.getInstance(
      drunkard
    );
    const series = await timelineService.buildTimeSeries(sessionEvents);
    const timeline: Timeline = await new Timeline()
      .build({ sessionId: session.toJson()._id, series })
      .save();

    const events: TimelineEvents = await timelineService.estimateEventTimes(
      timeline.toJson().series
    );

    await SessionService.updateSessionCache(
      session,
      events.soberAt,
      events.mostDrunkAt
    );
  }

  static async fetchBloodAlcoholPeaks(
    sessions: Session[]
  ): Promise<Point<number, number>[]> {
    const sessionIds = sessions.map((session: Session) => session.toJson()._id);
    const timelines: Timeline[] = await Timeline.findBySessionIds(sessionIds);
    return timelines
      .map((timeline: Timeline) => timeline.dangerousPeaks())
      .flat(1);
  }

  // fetches cached events from generated timeline
  static async fetchTimelineEvents(session: Session): Promise<TimelineEvents> {
    await session.populate();
    // TODO this syntax is awful, you should switch to Postgres with a Prisma layer
    const drunkard = new Drunkard(
      session,
      session.toJsonWithRelationships().user
    );

    const timeline = await Timeline.findBySessionId(session.toJson()._id);
    if (!timeline) {
      throw new Error('Session does not have associated events');
    }

    return TimelineService.getInstance(drunkard).estimateEventTimes(
      timeline.toJson().series
    );
  }

  // only accessible internally as a facade for the microservice to use
  private static async updateSessionCache(
    session: Session,
    soberAt: Projection,
    mostDrunkAt: Projection
  ): Promise<void> {
    await session.update({
      soberAt: new Date(soberAt.time),
      mostDrunkAt: new Date(mostDrunkAt.time),
      highestBac: mostDrunkAt.bloodAlcoholContent
    });
  }
}
