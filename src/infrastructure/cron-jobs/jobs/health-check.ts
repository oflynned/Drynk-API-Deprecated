import { HEALTH_UPDATE_AVAILABLE, pubsub } from '../../graphql/pubsub';
import { CronJob } from '../cron-job';

export class HealthCheckJob extends CronJob {
  async runJob(): Promise<void> {
    await pubsub.publish(HEALTH_UPDATE_AVAILABLE, {
      timestamp: new Date()
    });
  }

  cronFrequency(): string {
    return '*/5 * * * * *';
  }
}
