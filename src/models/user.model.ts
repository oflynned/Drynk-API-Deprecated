import { BaseDocument, BaseModelType, Joi, Schema } from 'mongoize-orm';
import { Sex } from '../common/helpers';

export interface UserType extends BaseModelType {
  name: string;
  email: string;
  providerId: string;
  weight?: number;
  height?: number;
  sex?: Sex;
}

class UserSchema extends Schema<UserType> {
  joiBaseSchema(): object {
    return {
      name: Joi.string().required(),
      email: Joi.string()
        .email()
        .required(),
      providerId: Joi.string().required()
    };
  }

  joiUpdateSchema(): object {
    return {
      weight: Joi.number().min(1),
      height: Joi.number().min(1),
      sex: Joi.string().valid('male', 'female')
    };
  }
}

export class User extends BaseDocument<UserType, UserSchema> {
  joiSchema(): UserSchema {
    return new UserSchema();
  }
}
