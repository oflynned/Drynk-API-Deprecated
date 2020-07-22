import { Request, Response, Router } from 'express';

import asyncHandler from 'express-async-handler';
import { SearchController } from './search.controller';

export type SearchRequest = Request & { query: { title: string } };

export const searchRoute = (controller: SearchController): Router => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req: SearchRequest, res: Response) =>
      controller.get(req, res)
    )
  );

  router.get(
    '/popular',
    asyncHandler(async (req: Request, res: Response) =>
      controller.getPopular(req, res)
    )
  );

  return router;
};
