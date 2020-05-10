import { gql } from 'apollo-server-express';

export const projectionValueDefinition = gql`
  type ProjectionValue {
    time: Float
    bloodAlcoholContent: Float
    alreadyPassed: Boolean
  }
`;
