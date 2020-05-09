import { Session } from '../../models/session.model';
import { Repository } from 'mongoize-orm';
import { SessionService, TimelineEvents } from '../../service/session.service';
import { pubsub, SESSION_UPDATE_AVAILABLE } from '../graphql/pubsub';

export const dispatchBacUpdate = () => {
  setInterval(async () => {
    const activeSessions: Session[] = await Repository.with(Session).findMany({
      soberAt: { $gt: new Date() }
    });

    await Promise.all(
      activeSessions.map(async (session: Session) => {
        const timelineEvent: TimelineEvents = await SessionService.fetchTimelineEvents(
          session
        );
        await pubsub.publish(SESSION_UPDATE_AVAILABLE, timelineEvent);
      })
    );
  }, 60 * 1000);
};
