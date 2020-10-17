require('dotenv').config();

import { exec } from 'shelljs';

class DumpDb {
  async run(): Promise<void> {
    const uri = process.env.BACKUP_FROM_URI;
    exec(`yarn db:dump:clean && mkdir -p dump`);

    // this.fetchCollectionAsBson(uri);

    ['users', 'drinks', 'sessions'].forEach(collection => {
      this.fetchCollectionAsJson(uri, collection);
    });
  }

  fetchCollectionAsBson(uri: string): void {
    exec(`mongodump --uri ${uri} --out ./dump`);
  }

  fetchCollectionAsJson(uri: string, collection: string): void {
    exec(
      `mongoexport --uri ${uri} --collection ${collection} --jsonArray --pretty --out ./dump/${collection}.json`
    );
  }
}

(async (): Promise<void> => {
  await new DumpDb().run();
})();
