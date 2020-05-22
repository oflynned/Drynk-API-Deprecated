import { CronJob } from 'cron';
import { bacUpdateFrequency, bacUpdateJob } from './bac-update';
import { Logger } from '../../common/logger';

const logger: Logger = Logger.getInstance('api.infrastructure.cron-jobs');

export const registerCronJobs = () => {
  new CronJob(bacUpdateFrequency, async () => {
    logger.info('Running bac update job');
    await bacUpdateJob();
  }).start();

  logger.info('Registered bac update cron job');
};
