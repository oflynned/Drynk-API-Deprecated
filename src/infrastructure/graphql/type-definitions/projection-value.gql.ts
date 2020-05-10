import { gql } from 'apollo-server-express';

export const projectionValueDefinition = gql`
  type ProjectionValue {
    time: Float
    bac: Float
    alreadyPassed: Boolean
  }
`;
