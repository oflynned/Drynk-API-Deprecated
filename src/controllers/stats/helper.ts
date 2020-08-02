import { Drink } from '../../models/drink.model';
import { Session } from '../../models/session.model';
import { percentage, sum } from '../../common/helpers';
import { User } from '../../models/user.model';
import { RiskGroup } from './overview.helper';

export type UnitInsights = {
  lowRisk: RiskGroup,
  increasedRisk: RiskGroup,
  count: number
}

export type CaloriesInsights = {
  count: number
}

export class StatisticsHelper {
  static async highestEthanolContent(drinks: Drink[]): Promise<object> {
    const mostPotentDrink = await drinks.reduce((a: Drink, b: Drink) =>
      a.ethanolMass() > b.ethanolMass() ? a : b
    );
    return mostPotentDrink.toJson();
  }

  static async averageHoursDrunk(sessions: Session[]): Promise<number> {
    const hoursDrunk = sessions.map((session: Session) => session.hoursDrunk());
    return sum(hoursDrunk) / sessions.length;
  }

  static async averageHoursDrunkOfDay(sessions: Session[]): Promise<number> {
    const avgHoursDrunk = await StatisticsHelper.averageHoursDrunk(sessions);
    return (avgHoursDrunk / 24) * 100;
  }

  static async totalHoursDrunk(sessions: Session[]): Promise<number> {
    const hoursDrunk = sessions.map((session: Session) => session.hoursDrunk());
    return sum(hoursDrunk);
  }

  static async averageUnitsPerSession(sessions: Session[]): Promise<number> {
    const unitsPerSession = await Promise.all(
      sessions.map(async (session: Session) => session.units())
    );
    return sum(unitsPerSession) / sessions.length;
  }

  static async mostUnitsPerSession(sessions: Session[]): Promise<object> {
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

  static async highestBac(sessions: Session[]): Promise<object> {
    const mostIntoxicatedSession = sessions.reduce((a: Session, b: Session) => {
      return a.toJson().highestBac > b.toJson().highestBac ? a : b;
    });

    return {
      session: mostIntoxicatedSession.toJson(),
      value: mostIntoxicatedSession.toJson().highestBac
    };
  }

  static async longestSession(sessions: Session[]): Promise<object> {
    const longestSession = sessions.reduce((a: Session, b: Session) => {
      return a.hoursDrunk() > b.hoursDrunk() ? a : b;
    });

    return {
      session: longestSession.toJson(),
      value: longestSession.hoursDrunk()
    };
  }

  static async intakeOverviewOverDays(
    user: User,
    drinks: Drink[],
    days?: number
  ): Promise<UnitInsights> {
    const lowRiskMax = 2 * days;
    const increasedRiskMax = user.isMale() ? 7 * days : 5 * days;
    const units = sum(drinks.map((drink: Drink) => drink.units()));
    return {
      lowRisk: {
        goalPercentage: percentage(units, lowRiskMax),
        max: lowRiskMax
      },
      increasedRisk: {
        goalPercentage: percentage(units, increasedRiskMax),
        max: increasedRiskMax
      },
      count: units
    };
  }

  static async drinkCalories(drinks: Drink[]): Promise<number> {
    return sum(drinks.map((drink: Drink) => drink.calories()));
  }

  static async drinkCount(drinks: Drink[]): Promise<number> {
    return drinks.length;
  }

  static flattenSessionDrinks(sessions: Session[]): Drink[] {
    return sessions
      .map((session: Session) => session.toJsonWithRelationships().drinks)
      .flat(1);
  }
}
