import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Drink {
    _id: ID!
    sessionId: ID!
    createdAt: Float!
    updatedAt: Float
    deletedAt: Float
    deleted: Boolean!
    volume: Int!
    abv: Float!
    drinkName: String!
  }

  type Puke {
    _id: ID!
    sessionId: ID!
    createdAt: Float!
    updatedAt: Float
    deletedAt: Float
    deleted: Boolean!
  }

  type ProjectionValue {
    time: Float!
    bac: Float!
    alreadyPassed: Boolean
  }

  type Projection {
    startedSessionAt: ProjectionValue
    currentState: ProjectionValue
    mostDrunkAt: ProjectionValue
    soberAt: ProjectionValue
  }

  union Event = Drink | Puke

  type Session {
    estimateEventTimes: Projection
    events: [Event]
  }

  type Payload {
    x: Int!
  }

  type Subscription {
    onSessionUpdate: Projection
  }

  type Query {
    getSessionDrinks(sessionId: ID!): [Drink]
    getCurrentSession(userId: String): Session
    getSessions(userId: String): [Session]
  }
`;
