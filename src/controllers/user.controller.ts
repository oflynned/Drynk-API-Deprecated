import { User, UserType } from '../models/user.model';
import { Repository } from 'mongoize-orm';

export const userAlreadyExists = async (params: UserType): Promise<boolean> => {
  // TODO change this as it needs to be verified against the social network's token ...
  return Repository.with(User).existsByQuery({ email: params.email });
};

export const createUser = async (params: UserType): Promise<object> => {
  const user: User = await new User().build(params).save();
  return user.toJson();
};

export const findUser = async (id: string): Promise<object> => {
  const user = await Repository.with(User).findById(id);
  return user.toJson();
};
