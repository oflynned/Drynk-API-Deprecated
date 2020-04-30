import { BaseDocument, BaseModelType, Joi, Schema } from 'mongoize-orm';
import { Sex, UnitPreference } from '../common/helpers';

export interface UserType extends BaseModelType {
  name: string;
  email: string;
  providerOrigin: string;
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
      providerOrigin: Joi.string()
        .valid('google', 'facebook', 'twitter')
        .required(),
      providerId: Joi.string().required(),

      weight: Joi.number()
        .min(1)
        .required(),
      height: Joi.number()
        .min(1)
        .required(),
      sex: Joi.string()
        .valid('male', 'female')
        .required()
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
