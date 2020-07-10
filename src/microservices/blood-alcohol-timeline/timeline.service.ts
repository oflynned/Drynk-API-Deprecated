import { Event } from '../../models/event.type';
import { ONE_HOUR_IN_MS, ONE_MINUTE_IN_MS, Point } from '../../common/helpers';
import { DigestService } from './digest.service';
import { Drunkard } from '../../models/drunkard.model';
import { TimelineEvents } from '../../services/session.service';
import { Session } from '../../models/session.model';
import { Timeline } from './timeline.model';
import { Repository } from 'mongoize-orm';

// based on these papers
// https://staff.fnwi.uva.nl/a.j.p.heck/Research/art/ICTMT8_2.pdf
// http://www.appstate.edu/~spruntwh/bac_ncctm.pdf
// https://staff.fnwi.uva.nl/a.j.p.heck/research/alcohol/lesson/pharmacokinetics.pdf
export class TimelineService {
  private _drunkard: Drunkard;
  private _digestiveSystem: DigestService;

  private constructor() {}

  static getInstance(drunkard: Drunkard) {
    return new TimelineService().buildSession(drunkard);
  }

  static async fetchSessionTimeline(session: Session): Promise<Timeline> {
    return Repository.with(Timeline).findOne({
      sessionId: session.toJson()._id
    });
  }

  buildSession(drunkard: Drunkard): TimelineService {
    this._drunkard = drunkard;
    this._digestiveSystem = new DigestService(drunkard);
    return this;
  }

  // builds a timeline for a set of events
  // outputs a raw series of points <x (time), y (bac)> per minute
  async buildTimeSeries(events: Event[]): Promise<Point<number, number>[]> {
    const timeOfFirstEvent = events[0].toJson().createdAt.getTime();
    const timeOfLastEvent = events[events.length - 1]
      .toJson()
      .createdAt.getTime();

    let timestamps = [];
    let timestamp = timeOfFirstEvent;

    while (timestamp < timeOfLastEvent + 24 * ONE_HOUR_IN_MS) {
      timestamps.push(timestamp);
      timestamp += ONE_MINUTE_IN_MS;
    }

    const series: Point<number, number>[] = await Promise.all(
      timestamps.map(
        async (time: number): Promise<Point<number, number>> => {
          const timeframeEvents: Event[] = events.filter((event: Event) => {
            const drinkAddedTime = event.toJson().createdAt.getTime();
            const lowerBound = drinkAddedTime - ONE_MINUTE_IN_MS / 2;
            const upperBound = drinkAddedTime + ONE_MINUTE_IN_MS / 2;
            return time > lowerBound && time < upperBound;
          });

          this._digestiveSystem.process(timeframeEvents);

          return {
            x: time,
            y: this._digestiveSystem.bloodAlcoholContent
          };
        }
      )
    );

    return series.filter(
      (point: Point<number, number>, index: number): boolean => {
        if (index === 0) {
          return true;
        }

        if (point.x > timeOfLastEvent) {
          return point.y > 0;
        }

        return true;
      }
    );
  }

  // returns current state for a given set of events
  async estimateEventTimes(
    timeSeries: Point<number, number>[]
  ): Promise<TimelineEvents> {
    const soberPoint = timeSeries[timeSeries.length - 1];
    const mostDrunkPoint: Point<number, number> = timeSeries.reduce(
      (
        prev: Point<number, number>,
        current: Point<number, number>
      ): Point<number, number> => (prev.y > current.y ? prev : current)
    );

    return {
      startedDrinkingAt: {
        time: timeSeries[0].x,
        bloodAlcoholContent: 0,
        alreadyPassed: timeSeries[0].x < Date.now()
      },
      currentState: {
        time: Date.now(),
        bloodAlcoholContent:
          soberPoint.x < Date.now()
            ? 0
            : this.bloodAlcoholContent(timeSeries, soberPoint)
      },
      mostDrunkAt: {
        time: mostDrunkPoint.x,
        bloodAlcoholContent: mostDrunkPoint.y,
        alreadyPassed: mostDrunkPoint.x < Date.now()
      },
      soberAt: {
        time: soberPoint.x,
        bloodAlcoholContent: 0,
        alreadyPassed: soberPoint.x < Date.now()
      }
    };
  }

  private bloodAlcoholContent(
    timeSeries: Point<number, number>[],
    soberPoint: Point<number, number>
  ): number {
    let closestPointInSeries: Point<number, number>;
    if (soberPoint.x < Date.now()) {
      closestPointInSeries = { x: Date.now(), y: 0 };
    } else {
      closestPointInSeries = timeSeries.filter(
        (point: Point<number, number>) => {
          return (
            point.x < Date.now() + ONE_MINUTE_IN_MS / 2 &&
            point.x > Date.now() - ONE_MINUTE_IN_MS / 2
          );
        }
      )[0];
    }

    return closestPointInSeries.y || 0;
  }
}
