import { projectionDefinition } from './types/projection.gql';
import { sessionDefinition } from './types/session.gql';
import { insightsDefinition } from './types/insights.gql';
import { userDefinition } from './types/user.gql';
import { scalarDefinition } from './types/scalars.gql';
import { baseDefinition } from './base.gql';
import { drinkDefinition } from './types/event';

export const typeDefs = [
  // base
  baseDefinition,
  scalarDefinition,

  // custom
  insightsDefinition,
  drinkDefinition,
  userDefinition,
  projectionDefinition,
  sessionDefinition
];
