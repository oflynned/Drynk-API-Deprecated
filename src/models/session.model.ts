import {
  BaseModelType,
  BaseRelationshipType,
  Joi,
  RelationalDocument,
  Repository,
  Schema
} from 'mongoize-orm';
import { Drink } from './drink.model';
import { MealSize } from '../common/helpers';
import { Puke } from './puke.model';
import { Event } from './event.type';

export interface SessionType extends BaseModelType {
  userId: string;
  mealSize: MealSize;
  soberAt?: Date;
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
    return {
      soberAt: Joi.date().required()
    };
  }
}

export interface SessionRelationships extends BaseRelationshipType {
  drinks: Drink[];
  pukes: Puke[];
}

export class Session extends RelationalDocument<
  SessionType,
  SessionSchema,
  SessionRelationships
> {
  joiSchema(): SessionSchema {
    return new SessionSchema();
  }

  async events(): Promise<Event[]> {
    const { drinks, pukes } = await this.relationalFields();
    return [...drinks, ...pukes].sort((a: Event, b: Event) => {
      const firstTime = a.toJson().createdAt.getTime();
      const secondTime = b.toJson().createdAt.getTime();
      if (firstTime < secondTime) {
        return -1;
      }

      if (firstTime > secondTime) {
        return 1;
      }

      return 0;
    });
  }

  protected async relationalFields(): Promise<SessionRelationships> {
    return {
      drinks: await Repository.with(Drink).findMany({
        sessionId: this.toJson()._id
      }),
      pukes: await Repository.with(Puke).findMany({
        sessionId: this.toJson()._id
      })
    };
  }
}
