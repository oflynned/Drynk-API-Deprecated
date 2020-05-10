import { gql } from 'apollo-server-express';

export const queryDefinition = gql`
  type Query {
    getSessionDrinks(sessionId: ID!): [Drink]
    getCurrentSession(userId: String): Session
    getSessions(userId: String): [Session]
  }
`;
