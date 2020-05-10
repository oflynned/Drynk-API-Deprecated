import { Session } from '../../models/session.model';
import { Repository } from 'mongoize-orm';
import { SessionService, TimelineEvents } from '../../service/session.service';
import { pubsub, SESSION_UPDATE_AVAILABLE } from '../graphql/pubsub';

// every minute
// TODO should drinks have their series normalised to be eveyr minute at 0s
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
      const timelineEvent: TimelineEvents = await SessionService.fetchTimelineEvents(
        session
      );

      // should filter updates by user id
      await pubsub.publish(SESSION_UPDATE_AVAILABLE, timelineEvent);
    })
  );
};
