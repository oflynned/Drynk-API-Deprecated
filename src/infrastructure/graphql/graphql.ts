import { ApolloServer } from 'apollo-server-express';
import { Application } from 'express';
import { Server as HttpServer, createServer } from 'http';
import { typeDefs } from './definitions';
import { resolvers } from './resolvers/resolvers';
import { Environment } from '../../config/environment';
import { authGqlContext, GqlContext } from '../middleware/identity.middleware';

export const graphql = (app: Application): HttpServer => {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    playground: Environment.isDevelopment(),
    introspection: Environment.isDevelopment(),
    context: async ({ req, connection }) => {
      if (connection && connection.context) {
        // subscription context
        return authGqlContext({ headers: { ...connection.context } } as any);
      }

      // request context
      return authGqlContext(req);
    }
  });

  apolloServer.applyMiddleware({ app });

  const httpServer = createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  return httpServer;
};
