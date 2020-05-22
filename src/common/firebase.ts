import firebase from 'firebase-admin';
import { AppOptions } from 'firebase-admin';
import { Logger } from './logger';

export class FirebaseHelper {
  private static logger: Logger = Logger.getInstance('api.common.firebase');

  static registerFirebase(options: AppOptions): void {
    firebase.initializeApp(options);
    this.logger.info('Initialised Firebase instance');
  }
}
