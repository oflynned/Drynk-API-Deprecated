import { Response, Router } from 'express';
import { Timeline } from '../../microservices/session/timeline.service';
import { ONE_DAY_IN_MS } from '../../common/helpers';
import { SessionUser } from '../../models/session-user.model';
import { withFirebaseUser, withUser } from '../middleware/identity.middleware';
import { AuthenticatedRequest } from '../middleware/authenticated.request';

const routes = (): Router => {
  const router = Router();

  router.get(
    '/',
    withFirebaseUser,
    withUser,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const sessionUser = new SessionUser('NONE', req.user);
      const timeline = await Timeline.getInstance(sessionUser);
      const series = await timeline.buildTimeSeries({
        createdAt: { $gte: new Date(Date.now() - ONE_DAY_IN_MS) }
      } as object);
      res.status(200).json(series);
    }
  );

  router.get(
    '/:id',
    withFirebaseUser,
    withUser,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const sessionUser = new SessionUser('NONE', req.user);
      const timeline = await Timeline.getInstance(sessionUser);

      const series = await timeline.buildTimeSeries({
        createdAt: { $gte: new Date(Date.now() - ONE_DAY_IN_MS) }
      } as object);
      res.status(200).json(series);
    }
  );

  router.get(
    '/events',
    withFirebaseUser,
    withUser,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const sessionUser = new SessionUser('NONE', req.user);
      const timeline = await Timeline.getInstance(sessionUser);

      const eventEstimates = await timeline.estimateEventTimes({});
      res.status(200).json(eventEstimates);
    }
  );

  return router;
};

export default routes();
