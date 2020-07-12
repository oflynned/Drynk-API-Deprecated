require('dotenv').config();

import { exec } from 'shelljs';

class RestoreDb {
  async run(): Promise<void> {
    const destination = process.env.RESTORE_TO_URI;
    exec(
      `mongorestore --drop --uri ${destination} --db heroku_44zd337d dump/drynk-api-prod`
    );
  }
}

(async (): Promise<void> => {
  await new RestoreDb().run();
})();
