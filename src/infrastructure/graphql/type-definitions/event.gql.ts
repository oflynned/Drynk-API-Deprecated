import { gql } from 'apollo-server-express';

export const eventUnionDefinition = gql`
  union Event = Drink | Puke
`;
