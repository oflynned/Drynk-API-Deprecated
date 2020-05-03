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
import { SessionController } from '../../controllers/session.controller';

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
      async (req: AuthenticatedRequest, res: Response): Promise<Response> =>
        SessionController.getSessions(req, res)
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
      async (req: SessionRequest, res: Response): Promise<Response> =>
        SessionController.getSessionSeries(req, res)
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
      async (req: AuthenticatedRequest, res: Response): Promise<Response> =>
        SessionController.getSessionDrinks(req, res)
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
      async (req: SessionRequest, res: Response): Promise<Response> =>
        SessionController.getSessionState(req, res)
    )
  );

  return router;
};

export default routes();
