import { Response, Router } from 'express';
import { createUser, findUser } from '../../controllers/user.controller';
import { withFirebaseUser, withUser } from '../middleware/identity.middleware';
import { AuthenticatedRequest } from '../middleware/authenticated.request';

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
    '/:id',
    withFirebaseUser,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      if (req.user.toJson()._id !== req.params.id) {
        res.status(403).json({ message: 'can only request own user account' });
        return;
      }

      const user = await findUser(req.params.id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).send();
      }
    }
  );

  return router;
};

export default routes();
