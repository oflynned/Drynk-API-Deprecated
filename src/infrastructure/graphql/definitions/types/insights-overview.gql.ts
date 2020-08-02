import { gql } from 'apollo-server-express';

export const overviewDefinition = gql`
    type Overview {
        units: UnitInsights
    }
`;
