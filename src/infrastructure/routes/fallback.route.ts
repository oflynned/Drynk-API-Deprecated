import { Request, Response, Router } from 'express';

const registerRoutes = (): Router => {
  const router = Router();

  router.all(
    '*',
    async (req: Request, res: Response): Promise<void> => {
      res.status(404).send();
    }
  );

  return router;
};

export default registerRoutes();
