import { Application, NextFunction, Request, Response } from 'express';

import indexRouter from '../routes';
import privacyRouter from '../routes/privacy.route';
import drinksRouter from '../routes/drinks.route';
import sessionRouter from '../routes/session.route';
import userRouter from '../routes/user.route';
import statsRouter from '../routes/stats.route';
import fallbackRouter from '../routes/fallback.route';
import { HttpError, HttpErrorType } from '../errors/http.error';
import { Logger } from '../../common/logger';
import { SentryHelper } from '../../common/sentry';
import { Environment } from '../../config/environment';

const logger: Logger = Logger.getInstance('api.infrastructure.sitemap');

export const sitemap = (app: Application): void => {
  app.use('/', indexRouter);
  app.use('/privacy', privacyRouter);
  app.use('/drinks', drinksRouter);
  app.use('/sessions', sessionRouter);
  app.use('/users', userRouter);
  app.use('/stats', statsRouter);
  app.use(fallbackRouter);

  app.use(
    (
      internalError: HttpError,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      if (Environment.isProduction()) {
        if (internalError.status >= 500) {
          // TODO tune this as necessary to prevent excess noise
          SentryHelper.captureException(internalError);
        }
      } else {
        console.error(internalError);
      }

      // INFO HttpErrorType is used as it needs to extend `Error` for tests to accept a throw
      //      and here we need to infer some internal properties
      const error = internalError as object & HttpErrorType;
      res.status(error._status);
      res.json({
        name: error._name,
        time: error._time,
        status: error._status,
        context: error._context
      });

      next();
    }
  );
};
