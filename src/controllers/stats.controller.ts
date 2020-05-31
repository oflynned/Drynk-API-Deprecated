import { AuthenticatedRequest } from '../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import { Session } from '../models/session.model';
import { dateAtTimeAgo } from '../common/helpers';
import { Repository } from 'mongoize-orm';
import { OverviewHelper } from './stats/overview.helper';

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
    const sessionsInLastWeek: Session[] = await Repository.with(
      Session
    ).findMany(
      {
        userId: req.user.toJson()._id,
        createdAt: { $gt: dateAtTimeAgo({ unit: 'days', value: 7 }) }
      },
      { populate: true }
    );

    if (sessionsInLastWeek.length === 0) {
      return res.status(204);
    }

    const overview = await OverviewHelper.overview(
      req.user,
      sessionsInLastWeek
    );
    return res.status(200).json(overview);
  }
}
