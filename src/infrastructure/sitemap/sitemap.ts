import { Application, Response, Request, NextFunction } from 'express';

import indexRouter from '../routes';
import drinksRouter from '../routes/drinks.route';
import sessionRouter from '../routes/session.route';
import userRouter from '../routes/user.route';
import fallbackRouter from '../routes/fallback.route';
import { HttpErrorType } from '../errors/http.error';

const sitemap = (app: Application): void => {
  app.use('/', indexRouter);
  app.use('/drinks', drinksRouter);
  app.use('/sessions', sessionRouter);
  app.use('/users', userRouter);
  app.use(fallbackRouter);

  app.use(
    (error: HttpErrorType, req: Request, res: Response, next: NextFunction) => {
      // INFO HttpErrorType is used as it needs to extend `Error` for tests to accept a throw
      //      and here we need to infer some internal properties
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

export default sitemap;
