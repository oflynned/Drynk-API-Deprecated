import { Request, Response, Router } from 'express';
import { createDrink, findAllDrinks } from '../../controllers/drink.controller';

const routes = (): Router => {
  const router = Router();

  router.post(
    '/',
    async (req: Request, res: Response): Promise<void> => {
      try {
        const drink = await createDrink(req.body);
        res.status(201).json(drink);
      } catch (e) {
        res.status(400).json(e);
      }
    }
  );

  router.get(
    '/',
    async (req: Request, res: Response): Promise<void> => {
      const drinks = await findAllDrinks();
      res.status(200).json(drinks);
    }
  );

  return router;
};

export default routes();
