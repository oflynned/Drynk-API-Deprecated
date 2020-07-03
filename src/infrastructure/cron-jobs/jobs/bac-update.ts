import { Session } from '../../../models/session.model';
import {
  SessionService,
  TimelineEvents
} from '../../../services/session.service';
import { pubsub, SESSION_UPDATE_AVAILABLE } from '../../graphql/pubsub';
import { CronJob } from '../cron-job';

export class BacUpdateJob extends CronJob {
  async runJob(): Promise<void> {
    const activeSessions: Session[] = await Session.findOngoingSessions();
    if (activeSessions.length === 0) {
      return;
    }

    await Promise.all(
      activeSessions.map(async (session: Session) => {
        const timelineEvents: TimelineEvents = await SessionService.fetchTimelineEvents(
          session
        );

        await pubsub.publish(SESSION_UPDATE_AVAILABLE, {
          events: timelineEvents,
          session
        });
      })
    );
  }

  cronFrequency(): string {
    return '5 * * * * *';
  }
}
