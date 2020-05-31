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
import { SessionController } from './session.controller';
import { sortTimeAscending } from '../models/event.type';
export class DrinkController {
  static async createDrink(
    req: SessionRequest,
    res: Response
  ): Promise<Response> {
    if (new Date(req.body.createdAt) > new Date()) {
      throw new BadRequestError('Drink start time cannot be in the future');
    }

    if (!(await req.session.isEventWithinTolerance(req.body.createdAt))) {
      throw new BadRequestError('Drink start time is too far in the past');
    }
    // the time passed is more than 3 hours before the session started
    try {
      const drink: Drink = await new Drink()
        .build({
          ...req.body,
          sessionId: req.session.toJson()._id
        })
        // if no created at is passed, default to date.now from the internal timestamps in mongoize-orm
        .override(req.body.createdAt ? { createdAt: req.body.createdAt } : {})
        .save();

      await req.session.refresh();
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

    return res
      .status(200)
      .json(
        drinks.sort(sortTimeAscending).map((drink: Drink) => drink.toJson())
      );
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

  static async destroyDrink(
    req: SessionRequest,
    res: Response
  ): Promise<Response> {
    const drink: Drink = await Repository.with(Drink).findOne(
      {
        _id: req.params.drinkId,
        sessionId: req.session.toJson()._id
      },
      { populate: true }
    );

    if (!drink) {
      throw new ResourceNotFoundError();
    }

    await drink.hardDelete();
    await SessionService.onSessionEvent(req.session);
    await req.session.refresh();

    return SessionController.getSessionsDrinks(req, res);
  }
}

import { SessionService } from '../service/session.service';
