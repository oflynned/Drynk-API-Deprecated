import { User } from '../models/user.model';
import { AuthenticatedRequest } from '../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import { BadRequestError } from '../infrastructure/errors';
import { SessionService } from '../service/session.service';
import { Session } from '../models/session.model';
import { FirebaseHelper } from '../common/firebase';

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
      // a user should not be able to update their own lastActiveAt, it should be internal only
      const { lastUpdatedAt, ...rest } = req.body;

      const payload = await req.user.validateUpdate(rest);
      const user = await req.user.update(payload);
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
        `${e.details?.map((e: { message: string }) => e.message) ||
          'Payload is malformed'}`
      );
    }
  }

  static async deleteUser(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    await FirebaseHelper.purgeFirebaseAccount(req.user.toJson().providerId);
    await req.user.softDeleteAndAnonymise();
    return res.status(204).send();
  }
}
