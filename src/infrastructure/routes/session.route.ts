import { Request, Response, Router } from 'express';
import { Session } from '../../services/session.service';

const routes = (): Router => {
  const router = Router();

  router.get(
    '/series',
    async (req: Request, res: Response): Promise<void> => {
      const session = await Session.getInstance();
      res.status(200).json(session.drinkSeries);
    }
  );
  router.get(
    '/bac',
    async (req: Request, res: Response): Promise<void> => {
      const session: Session = await Session.getInstance();
      const currentBac = session.bloodAlcoholContent();
      const hoursToSober = await session.timeToSober();
      res.status(200).json({ currentBac, hoursToSober });
    }
  );

  return router;
};

export default routes();
