import { NextFunction, Response } from 'express';
import { Repository } from 'mongoize-orm';
import { AuthenticatedRequest } from './authenticated.request';
import { Session } from '../../models/session.model';
import { SessionService } from '../../services/session.service';
import { ResourceNotFoundError } from '../errors';

export const withSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  if (!req.params.sessionId) {
    throw new ResourceNotFoundError();
  }

  const session: Session = await Repository.with(Session).findOne({
    _id: req.params.sessionId,
    userId: req.user.toJson()._id
  });

  if (!session) {
    throw new ResourceNotFoundError();
  }

  Object.assign(req, { session });
  next();
};

export const requireActiveSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const session: Session = await Repository.with(Session).findOne({
    userId: req.user.toJson()._id,
    soberAt: { $gt: new Date() }
  });

  if (!session) {
    return res.status(204).send();
  }

  Object.assign(req, { session });
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
