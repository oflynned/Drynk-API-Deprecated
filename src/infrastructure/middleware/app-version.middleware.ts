import { Response, NextFunction } from 'express';

export const checkClientVersion = (
  req: Request & { headers?: { 'x-app-version': string } },
  res: Response,
  next: NextFunction
) => {
  Object.assign(req, {
    clientAppVersion: req.headers['x-app-version'] ?? '1.0.0'
  });
  next();
};
