import { ApolloServer } from 'apollo-server-express';
import { Application } from 'express';
import { typeDefs } from './types';
import { resolvers } from './resolvers';
import { Server as HttpServer, createServer } from 'http';
import { pubsub, SESSION_UPDATE_AVAILABLE } from './pubsub';

export const graphql = (app: Application): HttpServer => {
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  apolloServer.applyMiddleware({ app });

  const httpServer = createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  return httpServer;
};
