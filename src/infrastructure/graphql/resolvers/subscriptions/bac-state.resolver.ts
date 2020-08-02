import { withFilter } from 'apollo-server-express';
import { TimelineEvents } from '../../../../services/session.service';
import { Session } from '../../../../models/session.model';
import { pubsub, SESSION_UPDATE_AVAILABLE } from '../../pubsub';

export type BackgroundUpdateType = { events: TimelineEvents; session: Session };

export const bacStateResolvers = {
  onStateUpdate: {
    // TODO https://trello.com/c/KKwX0RG3/320-subscription-memory-leak
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
};
