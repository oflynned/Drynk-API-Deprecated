require('dotenv').config();

import * as http from 'http';
import { Server } from './server';

import { firebaseConfig } from '../config/firebase.config';
import { sentryConfig } from '../config/sentry.config';
import { dbConfig } from '../config/database.config';
import { serverConfig } from '../config/server.config';

import { SentryHelper } from '../common/sentry';
import { FirebaseHelper } from '../common/firebase';
import { DatabaseHelper } from '../common/database';
import { DependencyInjector } from './dependency-injector';

export class App {
  async start(): Promise<http.Server> {
    // postgres
    const di = await new DependencyInjector().registerDependents();

    // mongodb -- to be deprecated
    await DatabaseHelper.registerDatabase(dbConfig());

    // other services
    FirebaseHelper.registerFirebase(firebaseConfig());
    SentryHelper.registerSentry(sentryConfig());

    const server = new Server().build(di.getContainer());
    return server.listen(serverConfig().port);
  }
}

(async () => new App().start())();
