import { drinkDefinition } from './drink.gql';
import { pukeDefinition } from './puke.gql';
import { projectionDefinition } from './projection.gql';
import { projectionValueDefinition } from './projection-value.gql';
import { sessionDefinition } from './session.gql';
import { eventUnionDefinition } from './event.gql';
import { queryDefinition } from './query.gql';
import { subscriptionDefinition } from './subscription.gql';

export const typeDefs = [
  drinkDefinition,
  pukeDefinition,
  projectionDefinition,
  projectionValueDefinition,
  sessionDefinition,
  eventUnionDefinition,
  queryDefinition,
  subscriptionDefinition
];
