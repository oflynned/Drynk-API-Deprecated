import { Session } from '../../../../models/session.model';
import { ResourceNotFoundError } from '../../../errors';
import { Overview, OverviewHelper } from '../../../../controllers/stats/overview.helper';
import { User } from '../../../../models/user.model';

export const insightsResolvers = {
  getOverview: async (
    context: object,
    args: { userId: string }
  ): Promise<Overview> => {
    const sessionsOverAllTime: Session[] = await Session.findByUserId(args.userId);
    if (sessionsOverAllTime.length === 0) {
      throw new ResourceNotFoundError();
    }

    const user = await User.findById(args.userId);
    const sessionsInLastWeek: Session[] = await Session.findWithinLastWeek(args.userId);
    return OverviewHelper.overview(user, sessionsInLastWeek);
  },
  getInsights: async (
    context: object,
    args: { userId: string }
  ): Promise<object> => {
    return {};
  }
};
