import { bacStateResolvers } from './subscriptions/bac-state.resolver';
import { sessionResolvers } from './queries/session.resolver';

export const resolvers = {
  Subscription: {
    ...bacStateResolvers
  },
  Query: {
    ...sessionResolvers
  }
};
