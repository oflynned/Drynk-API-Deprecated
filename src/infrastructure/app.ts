require('dotenv').config();

import serverConfig from '../config/server.config';
import { Application } from 'express';
import { Server } from './server';

(async () => {
  const app: Application = await new Server().buildServer();
  const port = app.get('port') || serverConfig.serverPort;
  app.listen(port, () => {
    console.log(
      `The server is running and listening on http://localhost:${port}`
    );
  });
})();
