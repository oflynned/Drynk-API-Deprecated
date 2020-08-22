import { Session } from '../models/session.model';
import { ResourceNotFoundError } from '../infrastructure/errors';
import { Overview, OverviewHelper } from '../controllers/stats/overview.helper';
import { User } from '../models/user.model';
import { InsightsController } from '../controllers/stats/in-depth.stats';

export class InsightsService {
  constructor() {}

  async getOverview(user: User): Promise<Overview> {
    const sessionsOverAllTime: Session[] = await Session.findByUserId(
      user.toJson()._id
    );

    if (sessionsOverAllTime.length === 0) {
      throw new ResourceNotFoundError();
    }

    const sessionsInLastWeek: Session[] = await Session.findWithinLastWeek(
      user.toJson()._id
    );

    return OverviewHelper.overview(user, sessionsInLastWeek);
  }

  async getInsights(user: User): Promise<object> {
    const sessionsOverAllTime: Session[] = await Session.findByUserId(
      user.toJson()._id
    );

    if (sessionsOverAllTime.length === 0) {
      throw new ResourceNotFoundError();
    }

    return InsightsController.buildAllAvailable(user);
  }
}
