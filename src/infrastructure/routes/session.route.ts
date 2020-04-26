import { Request, Response, Router } from 'express';
import { Session } from '../../services/session/session.service';
import { User } from '../../models/user.model';
import { ONE_DAY_IN_MS } from '../../common/helpers';
import { SessionUser } from '../../models/session-user.model';
import { Repository } from 'mongoize-orm';

const routes = (): Router => {
  const router = Router();

  router.get(
    '/series',
    async (req: Request, res: Response): Promise<void> => {
      const users = await Repository.with(User).findAll({});
      const user = new SessionUser('NONE', users[0]);
      const session = await Session.getInstance(user);

      const series = await session.buildTimeSeries({
        createdAt: { $gte: new Date(Date.now() - ONE_DAY_IN_MS) }
      } as object);
      res.status(200).json(series);
    }
  );

  router.get(
    '/graph/downed',
    async (req: Request, res: Response): Promise<void> => {
      const users = await Repository.with(User).findAll({});
      const user = new SessionUser('NONE', users[0]);
      const session = await Session.getInstance(user);

      const bacChartOverTime = await session.buildTimeSeries({
        drinkName: 'Gin'
      });
      res.status(200).json(bacChartOverTime);
    }
  );

  router.get(
    '/graph/spaced',
    async (req: Request, res: Response): Promise<void> => {
      const users = await Repository.with(User).findAll({});
      const user = new SessionUser('NONE', users[0]);
      const session = await Session.getInstance(user);

      const bacChartOverTime = await session.buildTimeSeries({
        drinkName: 'Vodka'
      });
      res.status(200).json(bacChartOverTime);
    }
  );

  router.get(
    '/events',
    async (req: Request, res: Response): Promise<void> => {
      const users = await Repository.with(User).findAll({});
      const user = new SessionUser('NONE', users[0]);
      const session = await Session.getInstance(user);

      const eventEstimates = await session.estimateEventTimes({});
      res.status(200).json(eventEstimates);
    }
  );

  return router;
};

export default routes();
