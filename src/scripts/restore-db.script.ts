require('dotenv').config();

import { exec } from 'shelljs';

class RestoreDb {
  async run(): Promise<void> {
    const destination = process.env.RESTORE_TO_URI;
    exec(
      `mongorestore --drop --uri ${destination} --db drynk dump/drynk-api-prod`
    );
  }
}

(async (): Promise<void> => {
  await new RestoreDb().run();
})();
