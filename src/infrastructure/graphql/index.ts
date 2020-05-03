import { ApolloServer, gql } from 'apollo-server-express';
import { Repository } from 'mongoize-orm';
import { Application } from 'express';
import { Drink, DrinkType } from '../../models/drink.model';
import { Puke } from '../../models/puke.model';
import { Timeline } from '../../microservices/blood-alcohol/timeline.model';

export const graphql = (app: Application) => {
  const typeDefs = gql`
    type Drink {
      _id: ID!
      sessionId: ID!
      createdAt: Float!
      updatedAt: Float
      deletedAt: Float
      deleted: Boolean!
      volume: Int!
      abv: Float!
      drinkName: String!
    }

    type Puke {
      _id: ID!
      sessionId: ID!
      createdAt: Float!
      updatedAt: Float
      deletedAt: Float
      deleted: Boolean!
    }

    type ProjectionValue {
      time: Float!
      bac: Float!
      alreadyPassed: Boolean
    }

    type Projection {
      startedSessionAt: ProjectionValue
      currentState: ProjectionValue
      mostDrunkAt: ProjectionValue
      soberAt: ProjectionValue
    }

    union Event = Drink | Puke

    type Session {
      estimateEventTimes: Projection
      events: [Event]
    }

    type Query {
      getDrinks(sessionId: ID!): [Drink]
      getPukes(sessionId: ID!): [Puke]
      getSession(userId: String): Session
    }

    type Mutation {
      addDrink(
        sessionId: String!
        volume: Int!
        abv: Float!
        drinkName: String!
      ): Drink!
      removeDrink(drinkId: ID!): Drink
      addPuke(sessionId: String!): Puke!
      removePuke(pukeId: ID!): Puke
    }
  `;

  const resolvers = {
    Query: {
      getDrinks: async (): Promise<Drink[]> => {
        return Repository.with(Drink).findAll({ populate: true });
      },
      getPukes: async (): Promise<Puke[]> => {
        return Repository.with(Puke).findAll({ populate: true });
      },
      getSession: async (
        context: object,
        args: { userId?: string }
      ): Promise<Timeline | {}> => {
        // const userProfile = await Repository.with(User).findById(args.userId);
        // if (!userProfile) {
        //   return {};
        // }
        // const user = new SessionUser('NONE', userProfile);
        // return Timeline.getInstance(user);
        return {};
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
      },
      addPuke: async (context: object, sessionId: string): Promise<Puke> => {
        return new Puke().build({ sessionId }).save();
      },
      removePuke: async (
        context: object,
        args: { pukeId: string }
      ): Promise<Puke> => {
        return Repository.with(Puke).deleteOne(args.pukeId);
      }
    }
  };

  const server = new ApolloServer({ typeDefs, resolvers });
  server.applyMiddleware({ app });
};
