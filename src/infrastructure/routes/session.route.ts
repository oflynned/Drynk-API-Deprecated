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
import { requireActiveSession } from '../middleware/session.middleware';
import { SessionController } from '../../controllers/session.controller';
import { DrinkController } from '../../controllers/drink.controller';
import { SessionService } from '../../service/session.service';
import { Repository } from 'mongoize-orm';
import { Session } from '../../models/session.model';

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

  // TODO this should be set to dev-only when drinks can be retroactively added
  router.get(
    '/:id/recalculate-session',
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
        const session: Session = await Session.findById(req.params.id);
        await SessionService.onSessionEvent(session);
        return res.status(200).send();
      }
    )
  );

  router.delete(
    '/now/drinks/:id',
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
        DrinkController.destroyDrink(req, res)
    )
  );

  return router;
};

export default routes();
