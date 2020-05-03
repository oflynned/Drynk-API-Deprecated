import { NextFunction, Response } from 'express';
import { Repository } from 'mongoize-orm';
import { AuthenticatedRequest } from './authenticated.request';
import { Session } from '../../models/session.model';
import { SessionService } from '../../service/session.service';

export const requirePastSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const session: Session = await Repository.with(Session).findOne({
    userId: req.user.toJson()._id,
    soberAt: { $gt: Date.now() }
  });

  if (!session) {
    // user is sober and/or hasn't added any drinks yet
    return res.status(204);
  }

  Object.assign(req, session);
  next();
};

export const createSessionIfSober = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const session: Session = await SessionService.createSessionOnSober(
    req.user,
    'none'
  );
  Object.assign(req, { session });
  next();
};
