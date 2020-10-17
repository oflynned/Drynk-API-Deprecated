import { NextFunction, Request, Response, Router } from 'express';
import { DrinkController } from '../../controllers/drink.controller';
import asyncHandler from 'express-async-handler';
import {
  requireUser,
  withFirebaseUser
} from '../middleware/identity.middleware';
import {
  AuthenticatedRequest,
  SessionRequest
} from '../middleware/authenticated.request';
import { createSessionIfSober } from '../middleware/session.middleware';

const routes = (): Router => {
  const router = Router();

  router.post(
    '/',
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: SessionRequest, res: Response, next: NextFunction) =>
        createSessionIfSober(req, res, next)
    ),
    asyncHandler(
      async (req: SessionRequest, res: Response): Promise<Response> =>
        DrinkController.createDrink(req, res)
    )
  );

  router.get(
    '/',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response): Promise<Response> =>
        DrinkController.findAllDrinks(req, res)
    )
  );

  router.get(
    '/:id',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response): Promise<Response> =>
        DrinkController.findDrink(req, res)
    )
  );

  return router;
};

export default routes();
