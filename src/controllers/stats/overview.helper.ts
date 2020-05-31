import { Session } from '../../models/session.model';
import { Drink } from '../../models/drink.model';
import { StatisticsHelper } from './helper';
import { User } from '../../models/user.model';
import { SessionService } from '../../service/session.service';
import { Point } from '../../common/helpers';

export class OverviewHelper {
  static async overview(user: User, sessions: Session[]): Promise<object> {
    const drinks: Drink[] = StatisticsHelper.flattenSessionDrinks(sessions);
    const dangerousPeaks: Point<
      number,
      number
    >[] = await SessionService.fetchBloodAlcoholPeaks(sessions);
    return {
      sex: user.toJson().sex,
      units: await StatisticsHelper.intakeOverviewOverDays(user, drinks, 7),
      calories: await StatisticsHelper.drinkCalories(drinks),
      timeDrunk: await StatisticsHelper.totalHoursDrunk(sessions),
      bloodAlcoholContentPeaks: dangerousPeaks.length
    };
  }
}
