import { Session } from '../../../../models/session.model';
import { TimelineEvents } from '../../../../service/session.service';
import { Repository } from 'mongoize-orm';
import { sortTimeDescending } from '../../../../models/event.type';
import { TimelineService } from '../../../../microservices/blood-alcohol-timeline';
import { ResourceNotFoundError } from '../../../errors';
import { Drunkard } from '../../../../models/drunkard.model';

export const sessionResolvers = {
  getCurrentSession: async (
    context: object,
    args: { userId: string }
  ): Promise<object> => {
    const sessions: Session[] = await Repository.with(Session).findMany({
      userId: args.userId
    });

    // TODO this is inefficient, offload this to the query
    const session = sessions.sort(sortTimeDescending)[0];
    const timeline = await TimelineService.fetchSessionTimeline(session);

    if (!timeline) {
      throw new ResourceNotFoundError();
    }

    const estimatedEventStates: TimelineEvents = await TimelineService.getInstance(
      new Drunkard(session, session.toJsonWithRelationships().user)
    ).estimateEventTimes(timeline.toJson().series);

    return {
      events: await session.events(),
      estimateEventTimes: estimatedEventStates
    };
  }
};
