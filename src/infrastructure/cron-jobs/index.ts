import { CronJob } from 'cron';
import { BacUpdateJob } from './jobs/bac-update';
import { Logger } from '../../common/logger';
import { CleanInactiveUnonboardedUsersJob } from './jobs/clean-churned-users';
import { Environment } from '../../config/environment';
import { CachePopularDrinksJob } from './jobs/cache-popular-drinks';

const logger: Logger = Logger.getInstance('api.infrastructure.cron-jobs');
const bacUpdateJob = new BacUpdateJob();
const cleanUsersJob = new CleanInactiveUnonboardedUsersJob();
const cachePopularDrinksJob = new CachePopularDrinksJob();

export const registerCronJobs = () => {
  new CronJob(bacUpdateJob.cronFrequency(), async () => {
    logger.info('Running bac update job');
    await bacUpdateJob.runJob();
  }).start();

  logger.info('Registered bac update cron job');

  new CronJob(cachePopularDrinksJob.cronFrequency(), async () => {
    logger.info('Running popular drinks caching job');
    await cachePopularDrinksJob.runJob();
  }).start();

  logger.info('Registered popular drinks cache cron job');

  if (Environment.isProduction()) {
    new CronJob(cleanUsersJob.cronFrequency(), async () => {
      logger.info('Running clean unonboarded users job');
      await cleanUsersJob.runJob();
    }).start();

    logger.info('Registered clean unonboarded users cron job');
  }
};
