import { Router } from 'express';
import { ResourceNotFoundError } from '../errors';
import asyncHandler from 'express-async-handler';

const registerRoutes = (): Router => {
  const router = Router();

  router.all(
    '*',
    asyncHandler(async () => {
      throw new ResourceNotFoundError();
    })
  );

  return router;
};

export default registerRoutes();
