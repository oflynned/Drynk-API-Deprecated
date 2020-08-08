import { GqlContext } from '../../../middleware/identity.middleware';

export const userResolvers = {
  getUser: async (
    root: object,
    args: object,
    context: GqlContext
  ): Promise<object> => context.user.toJson()
};
