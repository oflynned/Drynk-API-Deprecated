import { withFilter } from 'apollo-server-express';
import { TimelineEvents } from '../../../../services/session.service';
import { Session } from '../../../../models/session.model';
import { pubsub, SESSION_UPDATE_AVAILABLE } from '../../pubsub';
import { GqlContext } from '../../../middleware/identity.middleware';

export type CurrentSession = { events: TimelineEvents; session: Session };

export const bloodAlcoholContentResolvers = {
  onStateUpdate: {
    // TODO https://trello.com/c/KKwX0RG3/320-subscription-memory-leak
    subscribe: withFilter(
      () => pubsub.asyncIterator(SESSION_UPDATE_AVAILABLE),
      (
        payload: CurrentSession,
        variables: object,
        context: GqlContext
      ): boolean => {
        return payload.session.toJson().userId === context.user.toJson()._id;
      }
    ),
    resolve: (payload: CurrentSession): TimelineEvents => payload.events
  }
};
