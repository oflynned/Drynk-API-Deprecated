import { ApolloServer } from 'apollo-server-express';
import { Application } from 'express';
import { Server as HttpServer, createServer } from 'http';
import { typeDefs } from './type-definitions';
import { resolvers } from './resolvers/resolvers';
import { Environment } from '../../config/environment';

export const graphql = (app: Application): HttpServer => {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    playground: Environment.isDevelopment(),
    introspection: Environment.isDevelopment()
  });
  apolloServer.applyMiddleware({ app });

  const httpServer = createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  return httpServer;
};
