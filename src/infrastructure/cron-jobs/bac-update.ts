import { Session } from '../../models/session.model';
import { Repository } from 'mongoize-orm';
import { SessionService, TimelineEvents } from '../../service/session.service';
import { pubsub, SESSION_UPDATE_AVAILABLE } from '../graphql/pubsub';

// TODO should drinks have their series normalised to be every minute at 0s
//      so that the same update isn't broadcast twice as it doesn't decay exactly at the 0s mark?
export const bacUpdateFrequency = '30 * * * * *';

export const bacUpdateJob = async () => {
  const activeSessions: Session[] = await Repository.with(Session).findMany({
    soberAt: { $gt: new Date() }
  });

  if (activeSessions.length === 0) {
    return;
  }

  await Promise.all(
    activeSessions.map(async (session: Session) => {
      const timelineEvents: TimelineEvents = await SessionService.fetchTimelineEvents(
        session
      );

      // should filter updates by session id
      await pubsub.publish(SESSION_UPDATE_AVAILABLE, {
        events: timelineEvents,
        session
      });
    })
  );
};
