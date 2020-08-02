import { gql } from 'apollo-server-express';

export const riskGroup = gql`
    type RiskGroup {
        goalPercentage: Float!
        max: Float!
    }
`;

export const unitInsightsDefinition = gql`
    type UnitInsights {
        count: Float!
        lowRisk: RiskGroup!
        increasedRisk: RiskGroup!
    }
`;

export const aggregateUnitInsightsDefinition = gql`
    type AggregateUnitInsights {
        weekly: UnitInsights,
        monthly: UnitInsights,
        allTime: UnitInsights
    }
`;

export const insightsDefinition = gql`
    type Insights {
        units: AggregateUnitInsights
    }
`;
