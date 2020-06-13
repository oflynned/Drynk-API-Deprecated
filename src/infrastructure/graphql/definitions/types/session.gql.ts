import { gql } from 'apollo-server-express';

export const sessionDefinition = gql`
  type Session {
    estimateEventTimes: Projection
    events: [Drink]
  }
`;
