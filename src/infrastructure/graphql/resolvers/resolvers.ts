import { bacStateResolvers } from './subscriptions/bac-state.resolver';
import { sessionResolvers } from './queries/session.resolver';
import { insightsResolvers } from './queries/insights.resolver';
import { userResolvers } from './queries/user.resolver';
import { dateTimeTypeResolver } from './scalars.resolver';

export const resolvers = {
  ...dateTimeTypeResolver,

  Subscription: {
    ...bacStateResolvers
  },

  Query: {
    ...userResolvers,
    ...sessionResolvers,
    ...insightsResolvers
  }
};
