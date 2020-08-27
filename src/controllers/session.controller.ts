import { Repository } from 'mongoize-orm';
import { Session } from '../models/session.model';
import {
  AuthenticatedRequest,
  SessionRequest
} from '../infrastructure/middleware/authenticated.request';
import { Response } from 'express';
import { ResourceNotFoundError } from '../infrastructure/errors';
import { TimelineService } from '../microservices/blood-alcohol-timeline';
import { SessionService } from '../services/session.service';
import { sortTimeDescending } from '../models/event.type';
import { elapsedTimeFromMsToHours } from '../common/helpers';
import { Drink } from '../models/drink.model';

export class SessionController {
  static async getSessions(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    const sessions = await Repository.with(Session).findMany(
      {
        userId: req.user.toJson()._id
      },
      { populate: true }
    );

    const series = await Promise.all(
      sessions
        .sort(sortTimeDescending)
        .filter(
          (session: Session) =>
            session.toJsonWithRelationships().drinks.length > 0
        )
        .map(async (session: Session) => {
          return {
            ...session.toJson(),
            drinks: session
              .toJsonWithRelationships()
              .drinks.map((drink: Drink) => drink.toJson())
          };
        })
    );

    return res.status(200).json(series);
  }

  static async getSessionsDrinks(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    const sessions = await Repository.with(Session).findMany(
      {
        userId: req.user.toJson()._id
      },
      { populate: true }
    );

    if (sessions.length === 0) {
      throw new ResourceNotFoundError('No sessions have been created yet');
    }

    const payload = await Promise.all(
      sessions
        .filter(
          (session: Session) =>
            session.toJsonWithRelationships().drinks.length > 0
        )
        .sort(sortTimeDescending)
        .map(async (session: Session) => {
          return {
            ...session.toJson(),
            // TODO should a filter be done on only the _drunk_ time where bac > 0?
            //      yes it should since a session can last within 3 hours even if sober at some points
            hoursDrunk: elapsedTimeFromMsToHours(
              session.toJson().soberAt.getTime() -
                (await session.firstEvent()).toJson().createdAt.getTime()
            ),
            drinks: session
              .toJsonWithRelationships()
              .drinks.sort(sortTimeDescending)
              .map((drink: Drink) => drink.toJson())
          };
        })
    );

    return res.status(200).json(payload);
  }

  static async getSessionSeries(
    req: SessionRequest,
    res: Response
  ): Promise<Response> {
    if (req.session.toJson().userId !== req.user.toJson()._id) {
      throw new ResourceNotFoundError();
    }
    const timeline = await TimelineService.fetchSessionTimeline(req.session);
    if (!timeline) {
      throw new ResourceNotFoundError();
    }

    return res.status(200).json(timeline.toJson());
  }

  static async getLatestSessionSeries(
    req: SessionRequest,
    res: Response
  ): Promise<Response> {
    const userId = req.user.toJson()._id;
    const sessions: Session[] = await Session.findByUserId(userId);

    // TODO this is inefficient, offload this to the query
    const session = sessions.sort(sortTimeDescending)[0];
    const timeline = await TimelineService.fetchSessionTimeline(session);
    if (!timeline) {
      throw new ResourceNotFoundError();
    }

    return res.status(200).json(timeline.toJson());
  }

  static async getSessionDrinks(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    const session = await Repository.with(Session).findById(req.params.id, {
      populate: true
    });
    if (session.toJson().userId !== req.user.toJson()._id) {
      throw new ResourceNotFoundError();
    }

    return res.status(200).json(session.toJsonWithRelationships().drinks);
  }

  static async getSessionState(
    req: SessionRequest,
    res: Response
  ): Promise<Response> {
    try {
      const currentState = await SessionService.getTimelineEvents(req.session);
      return res.status(200).json(currentState);
    } catch (e) {
      throw new ResourceNotFoundError();
    }
  }
}
