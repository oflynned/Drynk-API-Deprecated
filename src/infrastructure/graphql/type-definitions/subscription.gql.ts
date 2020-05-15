import { gql } from 'apollo-server-express';

export const subscriptionDefinition = gql`
  type Subscription {
    onStateUpdate(sessionId: String!): Projection
  }
`;
