import { gql } from 'apollo-server-express';

export const projectionDefinition = gql`
  type Projection {
    startedSessionAt: ProjectionValue
    currentState: ProjectionValue
    mostDrunkAt: ProjectionValue
    soberAt: ProjectionValue
  }
`;
