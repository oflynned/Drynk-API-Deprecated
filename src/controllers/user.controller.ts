import { User } from '../models/user.model';
import { AuthenticatedRequest } from '../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import { BadRequestError } from '../infrastructure/errors';
import { Repository } from 'mongoize-orm';
import { SessionService } from '../service/session.service';
import { Session } from '../models/session.model';

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

  static async findUser(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json(req.user.toJson());
  }

  static async updateUser(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const user = await Repository.with(User).updateOne(
        req.user.toJson()._id,
        req.body
      );

      const activeSessions: Session[] = await Session.findActiveByUserId(
        user.toJson()._id
      );
      await Promise.all(
        activeSessions.map((session: Session) =>
          SessionService.onSessionEvent(session)
        )
      );

      return res.status(200).json(user.toJson());
    } catch (e) {
      throw new BadRequestError(
        `${e.details.map((e: { message: string }) => e.message) ||
          'Payload is malformed'}`
      );
    }
  }

  static async deleteUser(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    await req.user.softDelete();
    return res.status(204).send();
  }
}
