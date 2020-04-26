import { Application } from 'express';

import indexRouter from './routes';
import drinksRouter from './routes/drinks.route';
import sessionRouter from './routes/session.route';
import userRouter from './routes/user.route';
import fallbackRouter from './routes/fallback.route';

const sitemap = (app: Application): void => {
  app.use('/', indexRouter);

  app.use('/drinks', drinksRouter);
  app.use('/sessions', sessionRouter);
  app.use('/users', userRouter);

  app.use(fallbackRouter);
};

export default sitemap;
