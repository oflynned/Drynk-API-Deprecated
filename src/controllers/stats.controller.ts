import { Drink } from '../models/drink.model';
import { SessionRequest } from '../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import { Session } from '../models/session.model';
import { dateAtTimeAgo } from '../common/helpers';

export class StatsController {
  static async unitsInLastWeek(
    req: SessionRequest,
    res: Response
  ): Promise<Response> {
    // based off of nhs website
    // https://www.nhs.uk/live-well/alcohol-support/calculating-alcohol-units/

    const sessions: Session[] = await Session.findByUserId(
      req.user.toJson()._id
    );
    const drinksInLastWeek: Drink[] = await Drink.findBySessionIds(
      sessions.map((session: Session) => session.toJson()._id),
      dateAtTimeAgo({ unit: 'days', value: 7 }, new Date())
    );

    const units: number = drinksInLastWeek
      .map((drink: Drink) => drink.units())
      .reduce((a: number, b: number) => a + b, 0);

    return res.status(200).json({
      current: units,
      max: 14
    });
  }
}
