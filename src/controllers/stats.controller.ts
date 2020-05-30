import { Drink } from '../models/drink.model';
import { AuthenticatedRequest } from '../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import { Session } from '../models/session.model';
import { dateAtTimeAgo, sum } from '../common/helpers';
import { User } from '../models/user.model';

// based off of nhs websites
// https://www.nhs.uk/live-well/alcohol-support/calculating-alcohol-units/
// https://digital.nhs.uk/data-and-information/publications/statistical/health-survey-for-england/2018/summary

export class StatsController {
  static async unitsOverview(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    const lastWeek = await StatsController.intakeOverviewOverDays(req.user, 7);
    const lastMonth = await StatsController.intakeOverviewOverDays(
      req.user,
      30
    );
    return res.status(200).json({
      weekly: lastWeek,
      monthly: lastMonth,
      sex: req.user.toJson().sex
    });
  }

  private static async intakeOverviewOverDays(
    user: User,
    days: number
  ): Promise<object> {
    const sessions: Session[] = await Session.findByUserId(user.toJson()._id);
    const drinks: Drink[] = await Drink.findBySessionIds(
      sessions.map((session: Session) => session.toJson()._id),
      dateAtTimeAgo({ unit: 'days', value: days }, new Date())
    );

    return {
      calories: sum(drinks.map((drink: Drink) => drink.calories())),
      units: sum(drinks.map((drink: Drink) => drink.units())),
      lowRiskMax: 2 * days,
      increasedRiskMax: user.isMale() ? 7 * days : 5 * days
    };
  }
}
