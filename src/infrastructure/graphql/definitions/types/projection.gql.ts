import { gql } from 'apollo-server-express';

export const projectionDefinition = gql`
  type Projection {
    startState: ProjectionValue
    currentState: ProjectionValue
    mostDrunkState: ProjectionValue
    soberState: ProjectionValue
  }

  type ProjectionValue {
      time: Float
      bloodAlcoholContent: Float
      alreadyPassed: Boolean
  }
  
  extend type Subscription {
    onStateUpdate: Projection
  }
`;
