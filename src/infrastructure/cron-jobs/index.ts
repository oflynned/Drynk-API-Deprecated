import { CronJob } from 'cron';
import { bacUpdateFrequency, bacUpdateJob } from './bac-update';

export const registerCronJobs = () => {
  new CronJob(bacUpdateFrequency, async () => {
    console.log('Running bac update job');
    await bacUpdateJob();
  }).start();

  console.log('Registered bac update cron job');
};
