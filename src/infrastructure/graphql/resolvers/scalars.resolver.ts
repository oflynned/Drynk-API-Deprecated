import { GraphQLDateTime } from 'graphql-iso-date';
import { GraphQLJSON } from 'graphql-type-json';

export const dateTimeTypeResolver = {
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON
};
