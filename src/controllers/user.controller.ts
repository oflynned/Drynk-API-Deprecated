import { User } from '../models/user.model';
import { AuthenticatedRequest } from '../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import {
  BadRequestError,
  UnauthenticatedError
} from '../infrastructure/errors';

export class UserController {
  static async createUser(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const user: User = await new User()
        .build({ ...req.body, ...req.provider })
        .save();

      return res.status(201).json(user.toJson());
    } catch (e) {
      throw new BadRequestError(
        `${e.details.map((e: any) => e.message) || 'Payload is malformed'}`
      );
    }
  }

  static async updateUser(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const user = await req.user.update(req.body);
      return res.status(200).json(user.toJson());
    } catch (e) {
      throw new BadRequestError();
    }
  }

  static async findUser(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw new UnauthenticatedError();
    }

    return res.status(200).json(req.user.toJson());
  }
}
