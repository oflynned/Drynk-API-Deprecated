import {
  BaseDocument,
  BaseModelType,
  BaseRelationshipType,
  Joi,
  RelationalDocument,
  Repository,
  Schema
} from 'mongoize-orm';
import { Drink } from './drink.model';
import { MealSize } from '../common/helpers';

type Projection = {
  bloodAlcoholContent: number;
  time: number;
  eventHasHappened: boolean;
};

export interface SessionType extends BaseModelType {
  userId: string;
  mealSize: MealSize;
}

export class SessionSchema extends Schema<SessionType> {
  joiBaseSchema(): object {
    return {
      userId: Joi.string()
        .uuid()
        .required(),
      mealSize: Joi.string()
        .valid('none', 'small', 'large')
        .required()
    };
  }

  joiUpdateSchema(): object {
    return {};
  }
}

export interface SessionRelationships extends BaseRelationshipType {
  drinks: Drink[];
}

export class Session extends RelationalDocument<
  SessionType,
  SessionSchema,
  SessionRelationships
> {
  joiSchema(): SessionSchema {
    return new SessionSchema();
  }

  protected async relationalFields(): Promise<SessionRelationships> {
    return {
      drinks: await Repository.with(Drink).findMany({
        sessionId: this.toJson()._id
      })
    };
  }
}
