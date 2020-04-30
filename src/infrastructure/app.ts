require('dotenv').config();

import * as http from 'http';
import { bindGlobalDatabaseClient, MongoClient } from 'mongoize-orm';
import serverConfig from '../config/server.config';
import { Server } from './server';
import firebase from 'firebase-admin';
import { firebaseConfig } from '../config/firebase.config';

export class App {
  private constructor() {}

  static getInstance(): App {
    return new App();
  }

  async start(): Promise<http.Server> {
    const client: MongoClient = new MongoClient();
    const { dbConfig } = require('../config/database.config');
    await bindGlobalDatabaseClient(client, dbConfig());

    firebase.initializeApp(firebaseConfig());

    return new Server().build().listen(serverConfig.serverPort);
  }
}

(async () => await App.getInstance().start())();
