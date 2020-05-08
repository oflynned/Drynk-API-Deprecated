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
import { Event, sortTimeAscending, sortTimeDescending } from './event.type';

export interface SessionType extends BaseModelType {
  userId: string;
  mealSize: MealSize;
  soberAt?: Date;
  mostDrunkAt?: Date;
  highestBac?: number;
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
      soberAt: Joi.date().required(),
      mostDrunkAt: Joi.date().required(),
      highestBac: Joi.number().min(0)
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
    // TODO pull this up to a generic level so that events can be sorted
    return [...drinks, ...pukes].sort(sortTimeAscending);
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
