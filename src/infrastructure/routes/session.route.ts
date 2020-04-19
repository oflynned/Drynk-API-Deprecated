import { Request, Response, Router } from 'express';
import { Session } from '../../services/session.service';

const routes = (): Router => {
  const router = Router();

  router.get(
    '/series',
    async (req: Request, res: Response): Promise<void> => {
      const session = await Session.getInstance();
      res.status(200).json(await session.buildTimeSeries());
    }
  );

  router.get(
    '/graph/downed',
    async (req: Request, res: Response): Promise<void> => {
      const session = await Session.getInstance();
      const bacChartOverTime = await session.buildTimeSeries({
        drinkName: 'Gin'
      });
      res.status(200).json(bacChartOverTime);
    }
  );

  router.get(
    '/graph/spaced',
    async (req: Request, res: Response): Promise<void> => {
      const session = await Session.getInstance();
      const bacChartOverTime = await session.buildTimeSeries({
        drinkName: 'Vodka'
      });
      res.status(200).json(bacChartOverTime);
    }
  );

  router.get(
    '/events',
    async (req: Request, res: Response): Promise<void> => {
      const session = await Session.getInstance();
      const eventEstimates = await session.estimateEventTimes();
      res.status(200).json(eventEstimates);
    }
  );

  return router;
};

export default routes();
