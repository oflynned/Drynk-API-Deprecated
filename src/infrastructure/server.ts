import express, { Application } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';

import { sitemap } from './sitemap';
import { graphql } from './graphql';
import { pubsub, SESSION_UPDATE_AVAILABLE } from './graphql/pubsub';
import { Session } from '../models/session.model';
import { Repository } from 'mongoize-orm';
import { SessionService, TimelineEvents } from '../service/session.service';
import { TimelineService } from '../microservices/blood-alcohol/timeline.service';
import { User } from '../models/user.model';

export class Server {
  private _httpServer: http.Server;
  private _app: Application;

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
      console.log(`Server ready on localhost:${port}`);
    });
  }
}

export default Server;
