import { NextFunction, Request, Response } from 'express';
import { ResourceNotFoundError } from '../errors';
import { Environment } from '../../config/environment';

export const withDevEnvironment = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (Environment.isProduction()) {
    throw new ResourceNotFoundError();
  }

  next();
};
