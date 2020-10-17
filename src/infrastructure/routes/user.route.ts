import { NextFunction, Request, Response, Router } from 'express';
import { UserController } from '../../controllers/user.controller';
import {
  requireUser,
  withFirebaseUser,
  withUser
} from '../middleware/identity.middleware';
import { AuthenticatedRequest } from '../middleware/authenticated.request';

import asyncHandler from 'express-async-handler';
import { ApiProxy } from '../redundancy/api.proxy';

const proxy = new ApiProxy('users');

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
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      if (req.user) {
        return UserController.findUser(req, res);
      }

      const user = await UserController.createUser(req, res);

      await proxy.create(req.headers.authorization, user);

      return user;
    })
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
        requireUser(req, res, next)
    ),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      await proxy.update(req.headers.authorization, req.body);

      return UserController.updateUser(req, res);
    })
  );

  router.delete(
    '/',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      await proxy.delete(req.headers.authorization);

      return UserController.deleteUser(req, res);
    })
  );

  return router;
};

export default routes();
