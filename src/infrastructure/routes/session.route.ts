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
import {
  requireActiveSession,
  withSession
} from '../middleware/session.middleware';
import { SessionController } from '../../controllers/session.controller';
import { DrinkController } from '../../controllers/drink.controller';
import { SessionService } from '../../service/session.service';
import { Session } from '../../models/session.model';
import { ResourceNotFoundError } from '../errors';
import { withDevEnvironment } from '../middleware/development.middleware';

const routes = (): Router => {
  const router = Router();

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
        requireActiveSession(req, res, next)
    ),
    asyncHandler(
      async (req: SessionRequest, res: Response): Promise<Response> =>
        SessionController.getSessionState(req, res)
    )
  );

  router.get(
    '/now/series',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireActiveSession(req, res, next)
    ),
    asyncHandler(
      async (req: SessionRequest, res: Response): Promise<Response> =>
        SessionController.getLatestSessionSeries(req, res)
    )
  );

  router.get(
    '/drinks',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response): Promise<Response> =>
        SessionController.getSessionsDrinks(req, res)
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
        SessionController.getSessions(req, res)
    )
  );

  router.get(
    '/:sessionId/series',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        withSession(req, res, next)
    ),
    asyncHandler(
      async (req: SessionRequest, res: Response): Promise<Response> =>
        SessionController.getSessionSeries(req, res)
    )
  );

  router.get(
    '/:sessionId/drinks',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        withSession(req, res, next)
    ),
    asyncHandler(
      async (req: SessionRequest, res: Response): Promise<Response> =>
        SessionController.getSessionDrinks(req, res)
    )
  );

  router.get(
    '/:sessionId/recalculate',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withDevEnvironment(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
        const session: Session = await Session.findById(req.params.sessionId);
        if (!session) {
          throw new ResourceNotFoundError();
        }

        await SessionService.onSessionEvent(session);
        return res.status(200).send(session.toJson());
      }
    )
  );

  router.delete(
    '/:sessionId/drinks/:drinkId',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) =>
      withFirebaseUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        withSession(req, res, next)
    ),
    asyncHandler(
      async (req: SessionRequest, res: Response): Promise<Response> =>
        DrinkController.destroyDrink(req, res)
    )
  );

  return router;
};

export default routes();
