import { Request, Response, Router } from 'express';

const registerRoutes = (): Router => {
  const router = Router();

  router.get(
    '/health',
    async (req: Request, res: Response): Promise<void> => {
      res.json({ ping: 'pong' });
    }
  );

  return router;
};

export default registerRoutes();
