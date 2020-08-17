import { HEALTH_UPDATE_AVAILABLE, pubsub } from '../../pubsub';

export const healthSubscriptionResolvers = {
  onHealthUpdate: {
    subscribe: () => pubsub.asyncIterator(HEALTH_UPDATE_AVAILABLE),
    resolve: (payload: { timestamp: Date }) => payload
  }
};
