import { gql } from 'apollo-server-express';

export const drinkDefinition = gql`
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
`;
