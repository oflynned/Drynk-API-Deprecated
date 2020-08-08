import { Session } from '../../models/session.model';
import { Drink } from '../../models/drink.model';
import { StatisticsHelper } from './helper';
import { User } from '../../models/user.model';
import { SessionService } from '../../services/session.service';
import { Point } from '../../common/helpers';

export type RiskGroup = {
  goalPercentage: number;
  max: number;
};

export type Overview = {
  user: User;
  units: {
    lowRisk: RiskGroup;
    increasedRisk: RiskGroup;
    count: number;
  };
  calories: {
    count: number;
  };
  timeDrunk: {
    hours: number;
  };
  bloodAlcoholContentPeaks: {
    count: number;
  };
};

export class OverviewHelper {
  static async overview(user: User, sessions: Session[]): Promise<Overview> {
    const drinks: Drink[] = StatisticsHelper.flattenSessionDrinks(sessions);
    const dangerousPeaks: Point<
      number,
      number
    >[] = await SessionService.getBloodAlcoholPeaks(sessions);
    return {
      user,
      units: await StatisticsHelper.intakeOverviewOverDays(user, drinks, 7),
      calories: {
        count: await StatisticsHelper.drinkCalories(drinks)
      },
      timeDrunk: {
        hours: await StatisticsHelper.totalHoursDrunk(sessions)
      },
      bloodAlcoholContentPeaks: {
        count: dangerousPeaks.length
      }
    };
  }
}
