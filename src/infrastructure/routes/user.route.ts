import { NextFunction, Request, Response, Router } from 'express';
import { UserController } from '../../controllers/user.controller';
import {
  requireUser,
  withFirebaseUser,
  withUser
} from '../middleware/identity.middleware';
import { AuthenticatedRequest } from '../middleware/authenticated.request';

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
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      if (req.user) {
        return UserController.findUser(req, res);
      }

      return UserController.createUser(req, res);
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
    asyncHandler(async (req: AuthenticatedRequest, res: Response) =>
      UserController.updateUser(req, res)
    )
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
    asyncHandler(async (req: AuthenticatedRequest, res: Response) =>
      UserController.deleteUser(req, res)
    )
  );

  return router;
};

export default routes();
