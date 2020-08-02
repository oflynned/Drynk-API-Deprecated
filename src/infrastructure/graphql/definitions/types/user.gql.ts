import { gql } from 'apollo-server-express';

export const userDefinition = gql`
    type User {
        _id: ID!
        createdAt: DateTime!
        updatedAt: DateTime
        deletedAt: DateTime
        deleted: Boolean!
        email: String!
        height: Int
        weight: Int
        motivations: [String!]!
        name: String!
        sex: Sex
        unit: Unit
    }

    enum Sex {
        male
        female
    }

    enum Unit {
        metric
        us_imperial
    }
`;
