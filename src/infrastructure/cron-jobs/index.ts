import { CronJob } from 'cron';
import { BacUpdateJob } from './bac-update';
import { Logger } from '../../common/logger';
import { CleanInactiveUnonboardedUsersJob } from './clean-churned-users';

const logger: Logger = Logger.getInstance('api.infrastructure.cron-jobs');
const bacUpdateJob = new BacUpdateJob();
const cleanUsersJob = new CleanInactiveUnonboardedUsersJob();

export const registerCronJobs = () => {
  new CronJob(bacUpdateJob.cronFrequency(), async () => {
    logger.info('Running bac update job');
    await bacUpdateJob.runJob();
  }).start();

  logger.info('Registered bac update cron job');

  new CronJob(cleanUsersJob.cronFrequency(), async () => {
    logger.info('Running clean unonboarded users job');
    await cleanUsersJob.runJob();
  }).start();

  logger.info('Registered clean unonboarded users cron job');
};
