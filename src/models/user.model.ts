import { BaseDocument, BaseModelType, Joi, Schema } from 'mongoize-orm';
import { Sex, UnitPreference } from '../common/helpers';

export interface UserType extends BaseModelType {
  name: string;
  email: string;
  provider: string;
  providerId: string;

  weight?: number;
  height?: number;
  sex?: Sex;
  unitPreference?: UnitPreference;
}

class UserSchema extends Schema<UserType> {
  joiBaseSchema(): object {
    return {
      // required when accessing the app with an account
      name: Joi.string().required(),
      email: Joi.string()
        .email()
        .required(),
      providerOrigin: Joi.string()
        .valid('google', 'facebook', 'twitter')
        .required(),
      providerId: Joi.string().required(),

      // required later during onboarding
      weight: Joi.number()
        .min(1)
        .allow(null),
      height: Joi.number()
        .min(1)
        .allow(null),
      sex: Joi.string()
        .valid('male', 'female')
        .allow(null),
      unitPreference: Joi.string()
        .valid('metric', 'us_imperial', 'gb_imperial')
        .allow(null)
    };
  }

  joiUpdateSchema(): object {
    return {
      weight: Joi.number().min(1),
      height: Joi.number().min(1),
      sex: Joi.string().valid('male', 'female'),
      unitPreference: Joi.string().valid('metric', 'us_imperial', 'gb_imperial')
    };
  }
}

export class User extends BaseDocument<UserType, UserSchema> {
  joiSchema(): UserSchema {
    return new UserSchema();
  }
}
