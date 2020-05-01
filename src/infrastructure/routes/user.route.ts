import { NextFunction, Request, Response, Router } from 'express';
import { UserController } from '../../controllers/user.controller';
import { withFirebaseUser, withUser } from '../middleware/identity.middleware';
import { AuthenticatedRequest } from '../middleware/authenticated.request';
import { HttpError } from '../errors/http.error';

import asyncHandler from 'express-async-handler';

const routes = (): Router => {
  const router = Router();

  router.post(
    '/',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        withUser(req, res, next)
    ),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) =>
      UserController.createUser(req, res)
    )
  );

  router.get(
    '/',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) =>
      UserController.findUser(req, res)
    )
  );

  router.patch(
    '/',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        withUser(req, res, next)
    ),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const user = await req.user.update(req.body);
      res.status(200).json(user.toJson());
    })
  );

  return router;
};

export default routes();
