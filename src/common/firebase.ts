import firebase from 'firebase-admin';
import { AppOptions } from 'firebase-admin';
import { Logger } from './logger';
import { auth } from 'firebase-admin';
import { Environment } from '../config/environment';

export class FirebaseHelper {
  private static logger: Logger = Logger.getInstance('api.common.firebase');

  static registerFirebase(options: AppOptions): void {
    firebase.initializeApp(options);
    this.logger.info('Initialised Firebase instance');
  }

  static async purgeFirebaseAccount(providerId: string): Promise<void> {
    if (Environment.isProduction()) {
      await auth().deleteUser(providerId);
    }
  }
}
