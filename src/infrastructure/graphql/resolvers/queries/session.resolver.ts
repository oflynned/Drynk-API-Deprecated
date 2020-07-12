import { Session } from '../../../../models/session.model';
import { TimelineEvents } from '../../../../services/session.service';
import { sortTimeDescending } from '../../../../models/event.type';
import { TimelineService } from '../../../../microservices/blood-alcohol-timeline';
import { ResourceNotFoundError } from '../../../errors';
import { Drunkard } from '../../../../models/drunkard.model';

export const sessionResolvers = {
  getCurrentSession: async (
    context: object,
    args: { userId: string }
  ): Promise<object> => {
    const sessions: Session[] = await Session.findByUserId(args.userId);
    // TODO this is inefficient, offload this to the query
    const mostRecentSession = sessions.sort(sortTimeDescending)[0];
    const timeline = await TimelineService.fetchSessionTimeline(
      mostRecentSession
    );

    if (!timeline) {
      throw new ResourceNotFoundError();
    }

    const estimatedEventStates: TimelineEvents = await TimelineService.getInstance(
      new Drunkard(
        mostRecentSession,
        mostRecentSession.toJsonWithRelationships().user
      )
    ).estimateEventTimes(timeline.toJson().series);

    return {
      events: await mostRecentSession.events(),
      estimateEventTimes: estimatedEventStates
    };
  }
};
