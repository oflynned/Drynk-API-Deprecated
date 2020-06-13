import { gql } from 'apollo-server-express';

export const pukeDefinition = gql`
  type Puke {
    _id: ID!
    sessionId: ID!
    createdAt: Float!
    updatedAt: Float
    deletedAt: Float
    deleted: Boolean!
  }
`;
