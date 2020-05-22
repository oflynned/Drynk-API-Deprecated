import express, { Application } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';

import { sitemap } from './sitemap';
import { graphql } from './graphql';
import { registerCronJobs } from './cron-jobs';
import { Logger } from '../common/logger';

export class Server {
  private _httpServer: http.Server;
  private _app: Application;
  private logger: Logger = Logger.getInstance('api.infrastructure.server');

  get app(): Application {
    return this._app;
  }

  build(): Server {
    const app = express();
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(helmet());
    app.use(cors());

    this._httpServer = graphql(app);
    sitemap(app);

    // for use in integration testing
    this._app = app;

    return this;
  }

  async listen(port = this._app.get('port')): Promise<http.Server> {
    return this._httpServer.listen({ port }, () => {
      registerCronJobs();
      this.logger.info(`Server ready on localhost:${port}`);
    });
  }
}

export default Server;
