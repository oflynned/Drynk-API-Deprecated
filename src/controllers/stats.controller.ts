import { AuthenticatedRequest } from '../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import { Session } from '../models/session.model';
import { dateAtTimeAgo } from '../common/helpers';
import { Repository } from 'mongoize-orm';
import { OverviewHelper } from './stats/overview.helper';
import { ResourceNotFoundError } from '../infrastructure/errors';

// based off of nhs websites
// https://www.nhs.uk/live-well/alcohol-support/calculating-alcohol-units/
// https://digital.nhs.uk/data-and-information/publications/statistical/health-survey-for-england/2018/summary

export class StatsController {
  static async units(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    return res.status(200).json({});
  }

  static async calories(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    return res.status(200).json({});
  }

  static async timeDrunk(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    return res.status(200).json({});
  }

  static async bloodAlcoholContent(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    return res.status(200).json({});
  }

  static async overview(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    const sessionsOverAllTime: Session[] = await Session.findByUserId(
      req.user.toJson()._id
    );
    if (sessionsOverAllTime.length === 0) {
      throw new ResourceNotFoundError();
    }

    const sessionsEver: Session[] = await Session.findByUserId(req.user.toJson()._id);
    if (sessionsEver.length === 0) {
      return res.status(204).send();
    }

    const sessionsInLastWeek: Session[] = await Session.findWithinLastWeek(req.user.toJson()._id);
    const overview = await OverviewHelper.overview(
      req.user,
      sessionsInLastWeek
    );
    return res.status(200).json(overview);
  }
}
