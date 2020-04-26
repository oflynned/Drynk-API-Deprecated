import express, { Application } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import sitemap from './sitemap';
import { firebaseConfig } from '../config/firebase.config';

import { bindGlobalDatabaseClient, MongoClient } from 'mongoize-orm';
import { graphql } from './graphql';
import firebase from 'firebase-admin';

export class Server {
  async buildServer(): Promise<Application> {
    const client: MongoClient = new MongoClient();

    const { dbConfig } = require('../config/database.config');
    await bindGlobalDatabaseClient(client, dbConfig());

    firebase.initializeApp(firebaseConfig());

    const app = express();
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(helmet());
    app.use(cors());

    graphql(app);
    sitemap(app);

    return app;
  }
}
