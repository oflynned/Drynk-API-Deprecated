import { NextFunction, Request, Response, Router } from 'express';
import { withFirebaseUser, withUser } from '../middleware/identity.middleware';
import { AuthenticatedRequest } from '../middleware/authenticated.request';

import asyncHandler from 'express-async-handler';
import { StatsController } from '../../controllers/stats.controller';

const routes = (): Router => {
  const router = Router();

  router.get(
    '/overview',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        withUser(req, res, next)
    ),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) =>
      StatsController.unitsOverview(req, res)
    )
  );

  return router;
};

export default routes();
