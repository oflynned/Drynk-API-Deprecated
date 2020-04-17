import { ApolloServer, gql } from 'apollo-server-express';
import { Repository } from 'mongoize-orm';
import { Application } from 'express';
import { Drink, DrinkType } from '../../models/drink.model';
import { Session } from '../../services/session.service';

export const graphql = (app: Application) => {
  const typeDefs = gql`
    type Drink {
      _id: ID!
      createdAt: Float!
      updatedAt: Float
      deletedAt: Float
      deleted: Boolean!
      drinkWasDowned: Boolean!
      volume: Int!
      abv: Int!
      drinkName: String!
    }

    type Session {
      bloodAlcoholContent: Float
      timeToSober: Float
    }

    type Query {
      getDrinks: [Drink]
      getDrink(drinkId: String!): Drink
      getSession(userId: String): Session
    }

    type Mutation {
      addDrink(
        drinkWasDowned: Boolean!
        volume: Int!
        abv: Int!
        drinkName: String!
      ): Drink!
      removeDrink(drinkId: ID!): Drink
    }
  `;

  const resolvers = {
    Query: {
      getDrinks: async (): Promise<Drink[]> => {
        return Repository.with(Drink).findAll({ populate: true });
      },
      getDrink: async (
        context: object,
        args: { drinkId: string }
      ): Promise<Drink> => {
        return Repository.with(Drink).findById(args.drinkId, {
          populate: true
        });
      },
      getSession: async (
        context: object,
        args: { userId?: string }
      ): Promise<Session> => {
        return Session.getInstance();
      }
    },
    Mutation: {
      addDrink: async (context: object, payload: DrinkType): Promise<Drink> => {
        return new Drink().build(payload).save();
      },
      removeDrink: async (
        context: object,
        args: { drinkId: string }
      ): Promise<Drink> => {
        return Repository.with(Drink).deleteOne(args.drinkId);
      }
    }
  };

  const server = new ApolloServer({ typeDefs, resolvers });
  server.applyMiddleware({ app });
};
