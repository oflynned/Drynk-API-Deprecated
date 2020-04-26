import { Response, Router } from 'express';
import { createUser, findUser } from '../../controllers/user.controller';
import { withFirebaseUser, withUser } from '../middleware/identity.middleware';
import { AuthenticatedRequest } from '../middleware/authenticated.request';
import { Repository } from 'mongoize-orm';
import { User } from '../../models/user.model';

const routes = (): Router => {
  const router = Router();

  router.post(
    '/',
    withFirebaseUser,
    withUser,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      if (req.user) {
        res.status(200).json(req.user);
        return;
      }

      try {
        const user = await createUser({ ...req.body, ...req.provider });
        res.status(201).json(user);
      } catch (e) {
        console.log(e);
        res.status(400).json(e);
      }
    }
  );

  router.get(
    '/',
    withFirebaseUser,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const user = await findUser(req.params.id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).send();
      }
    }
  );

  router.patch(
    '/',
    withFirebaseUser,
    withUser,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const user = await req.user.update(req.body);
      res.status(200).json(user.toJson());
    }
  );

  return router;
};

export default routes();
