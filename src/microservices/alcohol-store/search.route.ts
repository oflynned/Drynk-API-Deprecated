import { Request, Response, Router } from 'express';

import asyncHandler from 'express-async-handler';
import { SearchController } from './search.controller';

export type SearchRequest = Request & { query: { title: string } };

const routes = (): Router => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req: SearchRequest, res: Response) =>
      SearchController.search(req, res)
    )
  );

  return router;
};

export default routes();
