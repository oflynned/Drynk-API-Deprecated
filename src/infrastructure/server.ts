import express, { Application } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';

import sitemap from './sitemap';
import { graphql } from './graphql';

export class Server {
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

    graphql(app);
    sitemap(app);

    this._app = app;

    return this;
  }

  async listen(port = this._app.get('port')): Promise<http.Server> {
    return this._app.listen(port, () => {
      console.log(
        `The server is running and listening on http://localhost:${port}`
      );
    });
  }
}

export default Server;
