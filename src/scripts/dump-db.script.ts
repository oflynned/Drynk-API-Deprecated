require('dotenv').config();

import { exec } from 'shelljs';

class DumpDb {
  async run(): Promise<void> {
    const uri = process.env.BACKUP_FROM_URI;
    exec(`yarn db:dump:clean && mkdir -p dump`);
    exec(`mongodump --uri ${uri} --out ./dump`)
  }
}

(async (): Promise<void> => {
  await new DumpDb().run();
})();