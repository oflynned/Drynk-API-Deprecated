import { drinkDefinition } from './types/drink.gql';
import { pukeDefinition } from './types/puke.gql';
import { projectionDefinition } from './types/projection.gql';
import { projectionValueDefinition } from './types/projection-value.gql';
import { sessionDefinition } from './types/session.gql';
import { queryDefinition } from './base/query.gql';
import { subscriptionDefinition } from './base/subscription.gql';
import { overviewDefinition } from './types/insights-overview.gql';
import {
  aggregateUnitInsightsDefinition,
  insightsDefinition, riskGroup,
  unitInsightsDefinition
} from './types/insights/unit-insights.gql';
import { userDefinition } from './types/user.gql';
import { scalarDefinition } from './types/scalars.gql';

const insightsDefs = [
  riskGroup,
  insightsDefinition,
  aggregateUnitInsightsDefinition,
  unitInsightsDefinition,
  overviewDefinition
];

const sessionDefs = [
  projectionDefinition,
  projectionValueDefinition,
  sessionDefinition
];

const eventDefs = [
  drinkDefinition,
  pukeDefinition
];

export const typeDefs = [
  ...eventDefs,
  ...sessionDefs,
  ...insightsDefs,
  userDefinition,
  scalarDefinition,
  queryDefinition,
  subscriptionDefinition
];
