import { Drink } from '../models/drink.model';
import { AuthenticatedRequest } from '../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import { Session } from '../models/session.model';
import { dateAtTimeAgo, percentage, sum } from '../common/helpers';
import { User } from '../models/user.model';
import { Repository } from 'mongoize-orm';

// based off of nhs websites
// https://www.nhs.uk/live-well/alcohol-support/calculating-alcohol-units/
// https://digital.nhs.uk/data-and-information/publications/statistical/health-survey-for-england/2018/summary

export class StatsController {
  private _user: User;

  private constructor(user: User) {
    this._user = user;
  }

  static getInstance(user: User): StatsController {
    return new StatsController(user);
  }

  static async unitsOverview(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    const sessionsInAllTime: Session[] = await Repository.with(
      Session
    ).findMany({ userId: req.user.toJson()._id }, { populate: true });

    if (sessionsInAllTime.length === 0) {
      return res.status(204);
    }

    const drinksInAllTime: Drink[] = this.flattenSessionDrinks(
      sessionsInAllTime
    );

    const sessionsInLastWeek: Session[] = await Repository.with(
      Session
    ).findMany(
      {
        userId: req.user.toJson()._id,
        createdAt: { $gt: dateAtTimeAgo({ unit: 'days', value: 7 }) }
      },
      { populate: true }
    );
    const drinksInLastWeek: Drink[] = this.flattenSessionDrinks(
      sessionsInLastWeek
    );

    const sessionsInLastMonth: Session[] = await Repository.with(
      Session
    ).findMany(
      {
        userId: req.user.toJson()._id,
        createdAt: { $gt: dateAtTimeAgo({ unit: 'days', value: 30 }) }
      },
      { populate: true }
    );
    const drinksInLastMonth: Drink[] = this.flattenSessionDrinks(
      sessionsInLastMonth
    );

    return res.status(200).json({
      sex: req.user.toJson().sex,
      units: {
        weekly: await StatsController.intakeOverviewOverDays(
          req.user,
          drinksInLastWeek,
          7
        ),
        monthly: await StatsController.intakeOverviewOverDays(
          req.user,
          drinksInLastMonth,
          30
        ),
        allTime: await StatsController.intakeOverviewOverDays(
          req.user,
          drinksInAllTime,
          req.user.daysSinceAccountCreation()
        )
      },
      calories: {
        weekly: await StatsController.drinkCalories(drinksInLastWeek),
        monthly: await StatsController.drinkCalories(drinksInLastMonth),
        allTime: await StatsController.drinkCalories(drinksInAllTime)
      },
      count: {
        weekly: await StatsController.drinkCount(drinksInLastWeek),
        monthly: await StatsController.drinkCount(drinksInLastMonth),
        allTime: await StatsController.drinkCount(drinksInAllTime)
      },
      sessions: {
        weekly: {
          highestBac: await StatsController.highestBac(sessionsInLastWeek),
          longestSession: await StatsController.longestSession(
            sessionsInLastWeek
          ),
          mostUnits: await StatsController.mostUnitsPerSession(
            sessionsInLastWeek
          ),
          averageUnits: await StatsController.averageUnitsPerSession(
            sessionsInLastWeek
          )
        },
        monthly: {
          highestBac: await StatsController.highestBac(sessionsInLastMonth),
          longestSession: await StatsController.longestSession(
            sessionsInLastMonth
          ),
          mostUnits: await StatsController.mostUnitsPerSession(
            sessionsInLastMonth
          ),
          averageUnits: await StatsController.averageUnitsPerSession(
            sessionsInLastMonth
          )
        },
        allTime: {
          highestBac: await StatsController.highestBac(sessionsInAllTime),
          longestSession: await StatsController.longestSession(
            sessionsInAllTime
          ),
          mostUnits: await StatsController.mostUnitsPerSession(
            sessionsInAllTime
          ),
          averageUnits: await StatsController.averageUnitsPerSession(
            sessionsInAllTime
          )
        }
      },
      drinks: {
        weekly: {
          highestEthanolContent: await StatsController.highestEthanolContent(
            drinksInLastWeek
          )
        },
        monthly: {
          highestEthanolContent: await StatsController.highestEthanolContent(
            drinksInLastMonth
          )
        },
        allTime: {
          highestEthanolContent: await StatsController.highestEthanolContent(
            drinksInAllTime
          )
        }
      },
      drunk: {
        weekly: {
          avgHoursDrunk: await StatsController.averageHoursDrunk(
            sessionsInLastWeek
          ),
          avgHoursDrunkAsPercentageOfDay: await StatsController.averageHoursDrunkOfDay(
            sessionsInLastWeek
          ),
          totalHoursDrunk: await StatsController.totalHoursDrunk(
            sessionsInLastWeek
          )
        },
        monthly: {
          avgHoursDrunk: await StatsController.averageHoursDrunk(
            sessionsInLastMonth
          ),
          avgHoursDrunkAsPercentageOfDay: await StatsController.averageHoursDrunkOfDay(
            sessionsInLastMonth
          ),
          totalHoursDrunk: await StatsController.totalHoursDrunk(
            sessionsInLastMonth
          )
        },
        allTime: {
          avgHoursDrunk: await StatsController.averageHoursDrunk(
            sessionsInAllTime
          ),
          avgHoursDrunkAsPercentageOfDay: await StatsController.averageHoursDrunkOfDay(
            sessionsInAllTime
          ),
          totalHoursDrunk: await StatsController.totalHoursDrunk(
            sessionsInAllTime
          )
        }
      }
    });
  }

  private static async highestEthanolContent(drinks: Drink[]): Promise<object> {
    const mostPotentDrink = await drinks.reduce((a: Drink, b: Drink) =>
      a.ethanolMass() > b.ethanolMass() ? a : b
    );
    return mostPotentDrink.toJson();
  }

  private static async averageHoursDrunk(sessions: Session[]): Promise<number> {
    const hoursDrunk = sessions.map((session: Session) => session.hoursDrunk());
    return sum(hoursDrunk) / sessions.length;
  }

  private static async averageHoursDrunkOfDay(
    sessions: Session[]
  ): Promise<number> {
    const avgHoursDrunk = await StatsController.averageHoursDrunk(sessions);
    return (avgHoursDrunk / 24) * 100;
  }

  private static async totalHoursDrunk(sessions: Session[]): Promise<number> {
    const hoursDrunk = sessions.map((session: Session) => session.hoursDrunk());
    return sum(hoursDrunk);
  }

  private static async averageUnitsPerSession(
    sessions: Session[]
  ): Promise<number> {
    const unitsPerSession = await Promise.all(
      sessions.map(async (session: Session) => session.units())
    );
    return sum(unitsPerSession) / sessions.length;
  }

  private static async mostUnitsPerSession(
    sessions: Session[]
  ): Promise<object> {
    const highestUnitIntake = await sessions.reduce(
      (a: Session, b: Session) => {
        return a.units() > b.units() ? a : b;
      }
    );

    return {
      session: highestUnitIntake.toJson(),
      value: await highestUnitIntake.units()
    };
  }

  private static async highestBac(sessions: Session[]): Promise<object> {
    const mostIntoxicatedSession = sessions.reduce((a: Session, b: Session) => {
      return a.toJson().highestBac > b.toJson().highestBac ? a : b;
    });

    return {
      session: mostIntoxicatedSession.toJson(),
      value: mostIntoxicatedSession.toJson().highestBac
    };
  }

  private static async longestSession(sessions: Session[]): Promise<object> {
    const longestSession = sessions.reduce((a: Session, b: Session) => {
      return a.hoursDrunk() > b.hoursDrunk() ? a : b;
    });

    return {
      session: longestSession.toJson(),
      value: longestSession.hoursDrunk()
    };
  }

  private static async intakeOverviewOverDays(
    user: User,
    drinks: Drink[],
    days?: number
  ): Promise<object> {
    const lowRiskMax = 2 * days;
    const increasedRiskMax = user.isMale() ? 7 * days : 5 * days;
    const units = sum(drinks.map((drink: Drink) => drink.units()));
    return {
      lowRiskGoalPercentage: percentage(units, lowRiskMax),
      increasedRiskGoalPercentage: percentage(units, increasedRiskMax),
      count: units,
      lowRiskMax,
      increasedRiskMax
    };
  }

  private static async drinkCalories(drinks: Drink[]): Promise<number> {
    return sum(drinks.map((drink: Drink) => drink.calories()));
  }

  private static async drinkCount(drinks: Drink[]): Promise<number> {
    return drinks.length;
  }

  private static flattenSessionDrinks(sessions: Session[]): Drink[] {
    return sessions
      .map((session: Session) => session.toJsonWithRelationships().drinks)
      .flat(1);
  }
}
