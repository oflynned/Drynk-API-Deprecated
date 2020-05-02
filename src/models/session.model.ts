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

type Projection = {
  bloodAlcoholContent: number;
  time: number;
  eventHasHappened: boolean;
};

export interface SessionType extends BaseModelType {
  userId: string;
}

export class SessionSchema extends Schema<SessionType> {
  joiBaseSchema(): object {
    return {
      userId: Joi.string()
        .uuid()
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
