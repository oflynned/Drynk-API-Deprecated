import { Drink } from '../models/drink.model';
import { Repository } from 'mongoize-orm';
import {
  AuthenticatedRequest,
  SessionRequest
} from '../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import {
  BadRequestError,
  ResourceNotFoundError
} from '../infrastructure/errors';
import { SessionService } from '../service/session.service';

export class DrinkController {
  static async createDrink(
    req: SessionRequest,
    res: Response
  ): Promise<Response> {
    try {
      const drink: Drink = await new Drink()
        .build({
          ...req.body,
          sessionId: req.session.toJson()._id
        })
        .save();
      await SessionService.onSessionEvent(req.session);
      return res.status(201).json(drink.toJson());
    } catch (e) {
      console.log(e);
      throw new BadRequestError();
    }
  }

  static async findAllDrinks(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    const drinks: Drink[] = await Repository.with(Drink).findAll();
    if (drinks.length === 0) {
      return res.status(200).json([]);
    }

    drinks.sort((a: Drink, b: Drink) => {
      if (a.toJson().createdAt.getTime() < b.toJson().createdAt.getTime()) {
        return 1;
      }
      if (a.toJson().createdAt.getTime() > b.toJson().createdAt.getTime()) {
        return -1;
      }

      return 0;
    });

    return res.status(200).json(drinks.map((drink: Drink) => drink.toJson()));
  }

  static async findDrink(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    const drink: Drink = await Repository.with(Drink).findById(req.params.id);
    if (!drink) {
      throw new ResourceNotFoundError();
    }

    return res.status(200).json(drink.toJson());
  }
}
