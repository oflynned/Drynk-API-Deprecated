import { drinkDefinition } from './types/drink.gql';
import { pukeDefinition } from './types/puke.gql';
import { projectionDefinition } from './types/projection.gql';
import { projectionValueDefinition } from './types/projection-value.gql';
import { sessionDefinition } from './types/session.gql';
import { queryDefinition } from './base/query.gql';
import { subscriptionDefinition } from './base/subscription.gql';

export const typeDefs = [
  drinkDefinition,
  pukeDefinition,
  projectionDefinition,
  projectionValueDefinition,
  sessionDefinition,
  queryDefinition,
  subscriptionDefinition
];
