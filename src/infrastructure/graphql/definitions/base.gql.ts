import { gql } from 'apollo-server-express';

export const baseDefinition = gql`
  type Health {
    timestamp: DateTime
  }

  type Query {
    getHealth: Health
  }

  type Subscription {
    onHealthUpdate: Health
  }
`;
