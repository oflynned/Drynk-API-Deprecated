import {
  Overview
} from '../../../../controllers/stats/overview.helper';
import { GqlContext } from '../../../middleware/identity.middleware';
import { InsightsService } from '../../../../services/insights.service';

const insightsService: InsightsService = new InsightsService();

export const insightsResolvers = {
  getOverview: async (
    root: object,
    args: object,
    context: GqlContext
  ): Promise<Overview> => insightsService.getOverview(context.user),
  getInsights: async (
    root: object,
    args: object,
    context: GqlContext
  ): Promise<object> => insightsService.getInsights(context.user)
};
