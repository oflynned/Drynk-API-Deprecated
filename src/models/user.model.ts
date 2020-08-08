import {
  BaseDocument,
  BaseModelType,
  Joi,
  Repository,
  Schema
} from 'mongoize-orm';
import {
  dateAtTimeAgo,
  elapsedTimeFromMsToHours,
  Sex,
  UnitPreference
} from '../common/helpers';

export interface UserType extends BaseModelType {
  name: string;
  email: string;
  providerId: string;
  weight?: number;
  height?: number;
  sex?: Sex;
  unit?: UnitPreference;
  lastActiveAt?: Date;
  pushToken?: string;
  motivations?: string[];
}

export class UserSchema extends Schema<UserType> {
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
      weight: Joi.number()
        .min(1)
        .max(999),
      height: Joi.number()
        .min(1)
        .max(999),
      sex: Joi.string().valid('male', 'female'),
      unit: Joi.string().valid('metric', 'us_imperial'),
      lastActiveAt: Joi.date(),
      pushToken: Joi.string(),
      motivations: Joi.array()
        .items(Joi.string())
        .min(1)
    };
  }
}

export class User extends BaseDocument<UserType, UserSchema> {
  static async findById(id: string): Promise<User> {
    return Repository.with(User).findById(id);
  }

  static async findByProviderId(providerId: string): Promise<User> {
    return Repository.with(User).findOne({ providerId });
  }

  static async findInactive(): Promise<User[]> {
    const date = dateAtTimeAgo({ unit: 'days', value: 7 });
    return Repository.with(User).findMany({
      createdAt: { $lt: date },
      weight: undefined,
      height: undefined,
      unit: undefined,
      sex: undefined
    });
  }

  async updateLastActiveAt(): Promise<User> {
    return Repository.with(User).updateOne(
      this.toJson()._id,
      { lastActiveAt: new Date() },
      { validateUpdate: false }
    );
  }

  async softDeleteAndAnonymise(): Promise<User> {
    await this.softDelete();
    const user = await this.update({
      name: 'deleted',
      email: 'deleted',
      providerId: 'deleted'
    });
    return user as User;
  }

  daysSinceAccountCreation(): number {
    return elapsedTimeFromMsToHours(
      Date.now() - this.toJson().createdAt.getTime()
    );
  }

  joiSchema(): UserSchema {
    return new UserSchema();
  }

  isMale(): boolean {
    return this.toJson().sex === 'male';
  }

  isOnboarded(): boolean {
    const { height, weight, sex, unit } = this.toJson();
    return (
      height !== undefined &&
      weight !== undefined &&
      sex !== undefined &&
      unit !== undefined
    );
  }
}
