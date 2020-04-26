import { Application } from 'express';

import indexRouter from './routes';
import drinksRouter from './routes/drinks.route';
import sessionRouter from './routes/session.route';
import userRouter from './routes/user.route';
import fallbackRouter from './routes/fallback.route';
import { withUser } from './middleware/identity.middleware';

const sitemap = (app: Application): void => {
  app.use('/', indexRouter);

  app.use('/drinks', withUser, drinksRouter);
  app.use('/sessions', withUser, sessionRouter);
  app.use('/users', userRouter);

  app.use(fallbackRouter);
};

export default sitemap;
