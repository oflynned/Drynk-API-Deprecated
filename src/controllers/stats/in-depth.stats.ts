import { Drink } from '../../models/drink.model';
import { AuthenticatedRequest } from '../../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import { Session } from '../../models/session.model';
import { dateAtTimeAgo } from '../../common/helpers';
import { Repository } from 'mongoize-orm';
import { StatisticsHelper } from './helper';

// based off of nhs websites
// https://www.nhs.uk/live-well/alcohol-support/calculating-alcohol-units/
// https://digital.nhs.uk/data-and-information/publications/statistical/health-survey-for-england/2018/summary

// TODO this is a backup, remove when it's been split
class StatsController {
  static async overview(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    const sessionsInAllTime: Session[] = await Repository.with(
      Session
    ).findMany({ userId: req.user.toJson()._id }, { populate: true });

    if (sessionsInAllTime.length === 0) {
      return res.status(204);
    }

    const drinksInAllTime: Drink[] = StatisticsHelper.flattenSessionDrinks(
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
    const drinksInLastWeek: Drink[] = StatisticsHelper.flattenSessionDrinks(
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
    const drinksInLastMonth: Drink[] = StatisticsHelper.flattenSessionDrinks(
      sessionsInLastMonth
    );

    return res.status(200).json({
      sex: req.user.toJson().sex,
      units: {
        weekly: await StatisticsHelper.intakeOverviewOverDays(
          req.user,
          drinksInLastWeek,
          7
        ),
        monthly: await StatisticsHelper.intakeOverviewOverDays(
          req.user,
          drinksInLastMonth,
          30
        ),
        allTime: await StatisticsHelper.intakeOverviewOverDays(
          req.user,
          drinksInAllTime,
          req.user.daysSinceAccountCreation()
        )
      },
      calories: {
        weekly: await StatisticsHelper.drinkCalories(drinksInLastWeek),
        monthly: await StatisticsHelper.drinkCalories(drinksInLastMonth),
        allTime: await StatisticsHelper.drinkCalories(drinksInAllTime)
      },
      count: {
        weekly: await StatisticsHelper.drinkCount(drinksInLastWeek),
        monthly: await StatisticsHelper.drinkCount(drinksInLastMonth),
        allTime: await StatisticsHelper.drinkCount(drinksInAllTime)
      },
      sessions: {
        weekly: {
          highestBac: await StatisticsHelper.highestBac(sessionsInLastWeek),
          longestSession: await StatisticsHelper.longestSession(
            sessionsInLastWeek
          ),
          mostUnits: await StatisticsHelper.mostUnitsPerSession(
            sessionsInLastWeek
          ),
          averageUnits: await StatisticsHelper.averageUnitsPerSession(
            sessionsInLastWeek
          )
        },
        monthly: {
          highestBac: await StatisticsHelper.highestBac(sessionsInLastMonth),
          longestSession: await StatisticsHelper.longestSession(
            sessionsInLastMonth
          ),
          mostUnits: await StatisticsHelper.mostUnitsPerSession(
            sessionsInLastMonth
          ),
          averageUnits: await StatisticsHelper.averageUnitsPerSession(
            sessionsInLastMonth
          )
        },
        allTime: {
          highestBac: await StatisticsHelper.highestBac(sessionsInAllTime),
          longestSession: await StatisticsHelper.longestSession(
            sessionsInAllTime
          ),
          mostUnits: await StatisticsHelper.mostUnitsPerSession(
            sessionsInAllTime
          ),
          averageUnits: await StatisticsHelper.averageUnitsPerSession(
            sessionsInAllTime
          )
        }
      },
      drinks: {
        weekly: {
          highestEthanolContent: await StatisticsHelper.highestEthanolContent(
            drinksInLastWeek
          )
        },
        monthly: {
          highestEthanolContent: await StatisticsHelper.highestEthanolContent(
            drinksInLastMonth
          )
        },
        allTime: {
          highestEthanolContent: await StatisticsHelper.highestEthanolContent(
            drinksInAllTime
          )
        }
      },
      drunk: {
        weekly: {
          avgHoursDrunk: await StatisticsHelper.averageHoursDrunk(
            sessionsInLastWeek
          ),
          avgHoursDrunkAsPercentageOfDay: await StatisticsHelper.averageHoursDrunkOfDay(
            sessionsInLastWeek
          ),
          totalHoursDrunk: await StatisticsHelper.totalHoursDrunk(
            sessionsInLastWeek
          )
        },
        monthly: {
          avgHoursDrunk: await StatisticsHelper.averageHoursDrunk(
            sessionsInLastMonth
          ),
          avgHoursDrunkAsPercentageOfDay: await StatisticsHelper.averageHoursDrunkOfDay(
            sessionsInLastMonth
          ),
          totalHoursDrunk: await StatisticsHelper.totalHoursDrunk(
            sessionsInLastMonth
          )
        },
        allTime: {
          avgHoursDrunk: await StatisticsHelper.averageHoursDrunk(
            sessionsInAllTime
          ),
          avgHoursDrunkAsPercentageOfDay: await StatisticsHelper.averageHoursDrunkOfDay(
            sessionsInAllTime
          ),
          totalHoursDrunk: await StatisticsHelper.totalHoursDrunk(
            sessionsInAllTime
          )
        }
      }
    });
  }
}
