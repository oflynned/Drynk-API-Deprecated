import {
  BaseDocument,
  BaseModelType,
  BaseRelationshipType,
  DatabaseClient,
  Joi,
  RelationalDocument,
  Repository,
  Schema
} from 'mongoize-orm';
import { Drink } from './drink.model';
import { MealSize } from '../common/helpers';
import { Puke } from './puke.model';
import { Event, sortTimeAscending, sortTimeDescending } from './event.type';
import { SessionService } from '../service/session.service';
import { User } from './user.model';

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
  user: User;
}

export class Session extends RelationalDocument<
  SessionType,
  SessionSchema,
  SessionRelationships
> {
  static async findOngoingSessions(): Promise<Session[]> {
    return Repository.with(Session).findMany({
      soberAt: { $gt: new Date() }
    });
  }

  static async findById(sessionId: string): Promise<Session> {
    return Repository.with(Session).findById(sessionId);
  }

  static async findActiveByUserId(userId: string): Promise<Session[]> {
    return Repository.with(Session).findMany({
      userId,
      soberAt: { $gt: new Date() }
    });
  }

  joiSchema(): SessionSchema {
    return new SessionSchema();
  }

  async events(): Promise<Event[]> {
    const { drinks, pukes } = await this.relationalFields();
    return [...drinks, ...pukes].sort(sortTimeAscending);
  }

  async refresh(
    client?: DatabaseClient
  ): Promise<BaseDocument<SessionType, Schema<SessionType>>> {
    await super.refresh(client);
    await SessionService.onSessionEvent(this);
    return this;
  }

  protected async relationalFields(): Promise<SessionRelationships> {
    return {
      drinks: await Repository.with(Drink).findMany({
        sessionId: this.toJson()._id
      }),
      pukes: await Repository.with(Puke).findMany({
        sessionId: this.toJson()._id
      }),
      user: await Repository.with(User).findById(this.toJson().userId)
    };
  }
}
