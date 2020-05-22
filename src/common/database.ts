import {
  bindGlobalDatabaseClient,
  ConnectionOptions,
  MongoClient
} from 'mongoize-orm';
import { Logger } from './logger';

export class DatabaseHelper {
  private static logger: Logger = Logger.getInstance(
    'api.infrastructure.server'
  );

  static async registerDatabase(config: ConnectionOptions): Promise<void> {
    const client: MongoClient = new MongoClient();
    this.logger.debug('Acquired new MongoClient instance');
    await bindGlobalDatabaseClient(client, config);
    this.logger.debug('Bound client to global scope');
    this.logger.info('Registered database in api scope');
  }
}
