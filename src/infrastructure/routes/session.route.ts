import { Request, Response, Router } from 'express';
import { Session } from '../../services/session.service';

const routes = (): Router => {
  const router = Router();

  router.get(
    '/series',
    async (req: Request, res: Response): Promise<void> => {
      const series = await new Session().calculateDrinkSeries();
      res.status(200).json(series);
    }
  );
  router.get(
    '/bac',
    async (req: Request, res: Response): Promise<void> => {
      const bac = await new Session().bloodAlcoholContent();
      res.status(200).json({ bac });
    }
  );

  return router;
};

export default routes();
