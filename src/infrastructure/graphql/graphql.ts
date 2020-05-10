import { ApolloServer } from 'apollo-server-express';
import { Application } from 'express';
import { Server as HttpServer, createServer } from 'http';
import { typeDefs } from './type-definitions';
import { resolvers } from './resolvers/resolvers';

export const graphql = (app: Application): HttpServer => {
  // TODO remove playground & introspection
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
    introspection: true
  });
  apolloServer.applyMiddleware({ app });

  const httpServer = createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  return httpServer;
};
