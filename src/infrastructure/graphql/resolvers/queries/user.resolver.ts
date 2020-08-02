import { ResourceNotFoundError } from '../../../errors';
import { User } from '../../../../models/user.model';

export const userResolvers = {
  getUser: async (
    context: object,
    args: { userId: string }
  ): Promise<object> => {
    const user = await User.findById(args.userId);
    if (!user) {
      throw new ResourceNotFoundError();
    }

    return user.toJson();
  }
};
