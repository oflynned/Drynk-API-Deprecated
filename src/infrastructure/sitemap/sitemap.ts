import { Application, Response, Request, NextFunction } from 'express';

import indexRouter from '../routes';
import drinksRouter from '../routes/drinks.route';
import sessionRouter from '../routes/session.route';
import userRouter from '../routes/user.route';
import fallbackRouter from '../routes/fallback.route';
import { HttpError } from '../errors/http.error';

const sitemap = (app: Application): void => {
  app.use('/', indexRouter);
  app.use('/drinks', drinksRouter);
  app.use('/sessions', sessionRouter);
  app.use('/users', userRouter);

  app.use(
    (error: HttpError, req: Request, res: Response, next: NextFunction) => {
      res.status(error.status);
      res.json({
        name: error.name,
        time: error.time,
        status: error.status,
        context: error.context
      });

      next(error);
    }
  );

  app.use(fallbackRouter);
};

export default sitemap;
