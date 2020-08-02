import { gql } from 'apollo-server-express';

export const queryDefinition = gql`
    type Query {
        getSessionDrinks(sessionId: ID!): [Drink]
        getCurrentSession(userId: ID!): Session
        getSessions(userId: ID!): [Session]

        getUser(userId: ID!): User

        getOverview(userId: ID!): Overview
        getInsights(userId: ID!): Insights
    }
`;
