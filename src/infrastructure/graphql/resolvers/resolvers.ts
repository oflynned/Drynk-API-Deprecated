import { Session } from '../../../models/session.model';
import { Repository } from 'mongoize-orm';
import { sortTimeDescending } from '../../../models/event.type';
import { TimelineService } from '../../../microservices/blood-alcohol/timeline.service';
import { pubsub, SESSION_UPDATE_AVAILABLE } from '../pubsub';
import { ResourceNotFoundError } from '../../errors';
import { TimelineEvents } from '../../../service/session.service';
import { Drunkard } from '../../../models/drunkard.model';
import { withFilter } from 'apollo-server-express';

export type BackgroundUpdateType = { events: TimelineEvents; session: Session };

export const resolvers = {
  Subscription: {
    onStateUpdate: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(SESSION_UPDATE_AVAILABLE),
        (
          payload: BackgroundUpdateType,
          variables: { userId: string }
        ): boolean => {
          return payload.session.toJson().userId === variables.userId;
        }
      ),
      resolve: (payload: BackgroundUpdateType): TimelineEvents => payload.events
    }
  },
  Query: {
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
  }
};
