import { gql } from 'apollo-server-express';

export const insightsDefinition = gql`
  type RiskGroup {
    goalPercentage: Float!
    max: Float!
  }

  type Overview {
    units: UnitInsights
  }

  type UnitInsights {
    count: Float!
    lowRisk: RiskGroup!
    increasedRisk: RiskGroup!
  }

  type AggregateUnitInsights {
    weekly: UnitInsights
    monthly: UnitInsights
    allTime: UnitInsights
  }

  type AggregateCalorieInsights {
    weekly: UnitInsights
    monthly: UnitInsights
    allTime: UnitInsights
  }

  type Insights {
    units: AggregateUnitInsights
  }

  extend type Query {
    getOverview: Overview
    getInsights: Insights
  }
`;
