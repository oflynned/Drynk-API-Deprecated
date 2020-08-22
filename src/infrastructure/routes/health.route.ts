import { NextFunction, Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
  AuthenticatedRequest,
  ClientAppRequest
} from '../middleware/authenticated.request';
import { withFirebaseUser } from '../middleware/identity.middleware';
import { AppController } from '../../controllers/app.controller';
import { checkClientVersion } from '../middleware/app-version.middleware';

const registerRoutes = (): Router => {
  const router = Router();
  const controller = new AppController();

  router.get(
    '/',
    async (req: Request, res: Response): Promise<void> => {
      res.json({ ping: 'pong' });
    }
  );

  router.get(
    '/app-version',
    asyncHandler(
      async (
        req: Request & { headers: { 'x-app-version': string } } & any,
        res: Response,
        next: NextFunction
      ) => checkClientVersion(req, res, next)
    ),
    asyncHandler(async (req: ClientAppRequest, res: Response) =>
      controller.isClientVersionPermitted(req, res)
    )
  );

  return router;
};

export default registerRoutes();
