import { NextFunction, Request, Response, Router } from 'express';
import { Timeline } from '../../microservices/session/timeline.service';
import { ONE_DAY_IN_MS } from '../../common/helpers';
import { SessionUser } from '../../models/session-user.model';
import {
  requireUser,
  withFirebaseUser,
  withUser
} from '../middleware/identity.middleware';
import { AuthenticatedRequest } from '../middleware/authenticated.request';
import asyncHandler from 'express-async-handler';
import { ResourceNotFoundError } from '../errors';

const routes = (): Router => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        withUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
        const sessionUser = new SessionUser('NONE', req.user);
        const timeline = await Timeline.getInstance(sessionUser);
        const series = await timeline.buildTimeSeries({
          createdAt: { $gte: new Date(Date.now() - ONE_DAY_IN_MS) }
        } as object);

        return res.status(200).json(series);
      }
    )
  );

  router.get(
    '/:id',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        withUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
        const sessionUser = new SessionUser('NONE', req.user);
        const timeline = await Timeline.getInstance(sessionUser);

        try {
          const series = await timeline.buildTimeSeries({
            createdAt: { $gte: new Date(Date.now() - ONE_DAY_IN_MS) }
          } as object);
          return res.status(200).json(series);
        } catch (e) {
          throw new ResourceNotFoundError();
        }
      }
    )
  );

  router.get(
    '/events',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        withUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
        const sessionUser = new SessionUser('NONE', req.user);
        const timeline = await Timeline.getInstance(sessionUser);

        const eventEstimates = await timeline.estimateEventTimes({});
        return res.status(200).json(eventEstimates);
      }
    )
  );

  return router;
};

export default routes();
