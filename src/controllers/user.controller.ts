import { User, UserType } from '../models/user.model';
import { Repository } from 'mongoize-orm';

export const createUser = async (params: UserType): Promise<object> => {
  const user: User = await new User().build(params).save();
  return user.toJson();
};

export const findUser = async (id: string): Promise<object> => {
  const user = await Repository.with(User).findById(id);
  return user.toJson();
};
