import { sessionResolvers } from './queries/session.resolver';
import { insightsResolvers } from './queries/insights.resolver';
import { userResolvers } from './queries/user.resolver';
import { dateTimeTypeResolver } from './scalars.resolver';
import { drinkResolvers } from './queries/drink.resolver';
import { healthResolvers } from './queries/health.resolver';
import { bloodAlcoholContentResolvers } from './subscriptions/blood-alcohol-content.subscription.resolver';
import { healthSubscriptionResolvers } from './subscriptions/health.subscription.resolver';

export const resolvers = {
  ...dateTimeTypeResolver,

  Subscription: {
    ...bloodAlcoholContentResolvers,
    ...healthSubscriptionResolvers
  },

  Query: {
    ...healthResolvers,
    ...drinkResolvers,
    ...userResolvers,
    ...sessionResolvers,
    ...insightsResolvers
  }
};
