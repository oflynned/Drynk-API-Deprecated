import { NextFunction, Request, Response, Router } from 'express';
import {
  requireUser,
  withFirebaseUser
} from '../middleware/identity.middleware';
import {
  AuthenticatedRequest,
  SessionRequest
} from '../middleware/authenticated.request';
import asyncHandler from 'express-async-handler';
import { ResourceNotFoundError } from '../errors';
import { Repository } from 'mongoize-orm';
import { Session } from '../../models/session.model';
import { TimelineService } from '../../microservices/blood-alcohol/timeline.service';
import { requirePastSession } from '../middleware/session.middleware';
import { SessionService } from '../../service/session.service';

const routes = (): Router => {
  const router = Router();

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
      async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
        const sessions = await Repository.with(Session).findMany({
          userId: req.user.toJson()._id
        });
        return res.status(200).json(sessions);
      }
    )
  );

  router.get(
    '/:id/series',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requirePastSession(req, res, next)
    ),
    asyncHandler(
      async (req: SessionRequest, res: Response): Promise<Response> => {
        if (req.session.toJson().userId !== req.user.toJson()._id) {
          throw new ResourceNotFoundError();
        }

        const timeline = await TimelineService.fetchSessionTimeline(
          req.session
        );
        if (!timeline) {
          throw new ResourceNotFoundError();
        }

        return res.status(200).json(timeline);
      }
    )
  );

  router.get(
    '/:id/drinks',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
        const session = await Repository.with(Session).findById(req.params.id, {
          populate: true
        });
        if (session.toJson().userId !== req.user.toJson()._id) {
          throw new ResourceNotFoundError();
        }

        return res.status(200).json(session.toJson().drinks);
      }
    )
  );

  router.get(
    '/now/state',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: SessionRequest, res: Response, next: NextFunction) =>
        requirePastSession(req, res, next)
    ),
    asyncHandler(
      async (req: SessionRequest, res: Response): Promise<Response> => {
        try {
          const currentState = await SessionService.fetchTimelineEvents(
            req.session,
            req.user
          );
          return res.status(200).json(currentState);
        } catch (e) {
          throw new ResourceNotFoundError();
        }
      }
    )
  );

  return router;
};

export default routes();
