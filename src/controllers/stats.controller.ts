import { Drink } from '../models/drink.model';
import { AuthenticatedRequest } from '../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import { Session } from '../models/session.model';
import { dateAtTimeAgo } from '../common/helpers';
import { User } from '../models/user.model';

// based off of nhs websites
// https://www.nhs.uk/live-well/alcohol-support/calculating-alcohol-units/
// https://digital.nhs.uk/data-and-information/publications/statistical/health-survey-for-england/2018/summary

export class StatsController {
  static async unitsInLastWeek(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    const units = await StatsController.unitsOverDays(req.user, 7);
    return res.status(200).json({ units });
  }

  static async unitsInLastMonth(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    const units = await StatsController.unitsOverDays(req.user, 30);
    return res.status(200).json({ units });
  }

  private static async unitsOverDays(
    user: User,
    days: number
  ): Promise<number> {
    const sessions: Session[] = await Session.findByUserId(user.toJson()._id);
    const drinksRelevant: Drink[] = await Drink.findBySessionIds(
      sessions.map((session: Session) => session.toJson()._id),
      dateAtTimeAgo({ unit: 'days', value: days }, new Date())
    );

    return drinksRelevant
      .map((drink: Drink) => drink.units())
      .reduce((a: number, b: number) => a + b, 0);
  }
}
