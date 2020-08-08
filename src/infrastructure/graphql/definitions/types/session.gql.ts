import { gql } from 'apollo-server-express';

export const sessionDefinition = gql`
  type Session {
    estimateEventTimes: Projection
    events: [Drink]
  }

  extend type Query {
    getSessionDrinks(sessionId: ID!): [Drink]
    getCurrentSession(userId: ID!): Session
    getSessions(userId: ID!): [Session]
  }
`;
