import { User } from '../models/user.model';
import { AuthenticatedRequest } from '../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import { BadRequestError } from '../infrastructure/errors/bad-request.error';
import { UnauthenticatedError } from '../infrastructure/errors/unauthenticated.error';
import asyncHandler from 'express-async-handler';

export class UserController {
  static async createUser(req: AuthenticatedRequest, res: Response) {
    return asyncHandler(async () => {
      if (req.user) {
        return res.status(200).json(req.user.toJson());
      }

      try {
        const user: User = await new User()
          .build({ ...req.body, ...req.provider })
          .save();

        return res.status(201).json(user.toJson());
      } catch (e) {
        throw new BadRequestError('User payload is malformed');
      }
    });
  }

  static async findUser(req: AuthenticatedRequest, res: Response) {
    return asyncHandler(async () => {
      if (!req.user) {
        throw new UnauthenticatedError('User is not authenticated');
      }

      return res.status(200).json(req.user.toJson());
    });
  }
}
