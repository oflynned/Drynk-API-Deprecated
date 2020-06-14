import { Request, Response, Router } from 'express';

const registerRoutes = (): Router => {
  const router = Router();

  router.get(
    '/version',
    async (req: Request, res: Response): Promise<void> => {
      res.json({
        version: 2,
        dateEffective: '2020-06-14'
      });
    }
  );

  router.get(
    '/policy',
    async (req: Request, res: Response): Promise<void> => {
      res.redirect('https://drynk.syzible.com/privacy-policy');
    }
  );

  return router;
};

export default registerRoutes();
