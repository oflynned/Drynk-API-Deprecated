import { Session } from '../../models/session.model';
import { Drink } from '../../models/drink.model';
import { StatisticsHelper } from './helper';
import { User, UserType } from '../../models/user.model';
import { SessionService } from '../../services/session.service';
import { Point } from '../../common/helpers';

export type RiskGroup = {
  goalPercentage: number;
  max: number;
};

export type Overview = {
  user: UserType;
  units: {
    lowRisk: RiskGroup;
    increasedRisk: RiskGroup;
    count: number;
  };
  calories: number;
  timeDrunk: number;
  bloodAlcohol: {
    peaks: number;
  };
};

export class OverviewHelper {
  static async overview(user: User, sessions: Session[]): Promise<Overview> {
    const drinks: Drink[] = StatisticsHelper.flattenSessionDrinks(sessions);
    const dangerousPeaks: Point<number,
      number>[] = await SessionService.getBloodAlcoholPeaks(sessions);
    return {
      user: user.toJson(),
      units: await StatisticsHelper.intakeOverviewOverDays(user, drinks, 7),
      calories: await StatisticsHelper.drinkCalories(drinks),
      timeDrunk: await StatisticsHelper.totalHoursDrunk(sessions),
      bloodAlcohol: {
        peaks: dangerousPeaks.length
      }
    };
  }
}
