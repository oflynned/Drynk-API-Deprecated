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
import { Repository } from 'mongoize-orm';
import { Session } from '../../models/session.model';
import { Drink } from '../../models/drink.model';

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
        const sessions = await Repository.with(Session).findMany({
          userId: req.user.toJson()._id
        });
        const sessionIds = sessions.map(
          (session: Session) => session.toJson()._id
        );
        return res.status(200).json(sessionIds);
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
        withUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        requireUser(req, res, next)
    ),
    asyncHandler(
      async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
        // TODO can also be abstracted out to a middleware to fetch session ...
        const session = await Repository.with(Session).findById(req.params.id);
        // TODO can be abstracted out to middleware as a user owns sessions, drinks, events ...
        if (session.toJson().userId !== req.user.toJson()._id) {
          throw new ResourceNotFoundError();
        }
        // TODO meal size  and any other info should be fetched from the session instead
        const sessionUser = new SessionUser(session, req.user);
        const timeline = await Timeline.getInstance(sessionUser);

        // TODO events should be passed to the microservice
        //      it should not know about other collections
        const series = await timeline.buildTimeSeries({
          createdAt: { $gte: new Date(Date.now() - ONE_DAY_IN_MS) }
        } as object);
        return res.status(200).json(series);
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
        withUser(req, res, next)
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
    '/state',
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
        // TODO get most recent session for the user if something is active from the cached timeline from the service
        //      otherwise return no session active, therefore sober
        const sessionUser = new SessionUser(new Session(), req.user);
        const timeline = await Timeline.getInstance(sessionUser);
        const eventEstimates = await timeline.estimateEventTimes({});
        return res.status(200).json(eventEstimates);
      }
    )
  );

  return router;
};

export default routes();
