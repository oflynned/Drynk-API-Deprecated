import { Application } from 'express';

import indexRouter from './routes';
import drinksRouter from './routes/drinks.route';
import sessionRouter from './routes/session.route';
import fallbackRouter from './routes/fallback.route';

const sitemap = (app: Application): void => {
  app.use('/', indexRouter);

  app.use('/drinks', drinksRouter);
  app.use('/session', sessionRouter);

  app.use(fallbackRouter);
};

export default sitemap;
