import { gql } from 'apollo-server-express';

export const drinkDefinition = gql`  
  type Puke {
      _id: ID!
      sessionId: ID!
      createdAt: Float!
      updatedAt: Float
      deletedAt: Float
      deleted: Boolean!
  }
    
  type Drink {
    _id: ID!
    sessionId: ID!
    createdAt: DateTime!
    updatedAt: DateTime
    deletedAt: DateTime
    deleted: Boolean!
    volume: Int!
    abv: Float!
    drinkName: String!
  }

  extend type Query {
    getDrink(id: ID): Drink
    getDrinks: [Drink!]
  }
`;
