import { Drink } from '../../models/drink.model';
import { Repository } from 'mongoize-orm';
import { User } from '../../models/user.model';
import { Event } from '../../models/event.facade';
import { ONE_HOUR_IN_MS, ONE_MINUTE_IN_MS, Point } from '../../common/helpers';
import { DigestiveSystem } from './digestive-system';
import { Puke } from '../../models/puke.model';

type Query = {
  sessionId?: string;
  drinkName?: string;
};

// based on these papers
// https://staff.fnwi.uva.nl/a.j.p.heck/Research/art/ICTMT8_2.pdf
// http://www.appstate.edu/~spruntwh/bac_ncctm.pdf
// https://staff.fnwi.uva.nl/a.j.p.heck/research/alcohol/lesson/pharmacokinetics.pdf
export class Session {
  private _user: User;
  private _digestiveSystem: DigestiveSystem;

  private constructor() {}

  static async getInstance(user: User) {
    return new Session().buildSession(user);
  }

  async buildSession(user: User): Promise<Session> {
    this._user = user;
    this._digestiveSystem = new DigestiveSystem(this._user);
    return this;
  }

  async buildTimeSeries(query: Query = {}): Promise<Point<number, number>[]> {
    const drinks: Drink[] = await Repository.with(Drink).findMany(query);
    const pukes: Puke[] = await Repository.with(Puke).findMany(query);
    const events: Event[] = []
      .concat(drinks, pukes)
      .sort((a: Event, b: Event) => {
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

    const timeOfLastEvent = events[events.length - 1]
      .toJson()
      .createdAt.getTime();
    let timestamps = [];
    let timePeriod = events[0].toJson().createdAt.getTime();

    while (timePeriod < timeOfLastEvent + 24 * ONE_HOUR_IN_MS) {
      timestamps.push(timePeriod);
      timePeriod += ONE_MINUTE_IN_MS;
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

        return point.y > 0;
      }
    );
  }

  async estimateEventTimes(): Promise<object> {
    const timeSeries = await this.buildTimeSeries();
    const soberPoint = timeSeries[timeSeries.length - 1];
    const mostDrunkPoint: Point<number, number> = timeSeries.reduce(
      (
        prev: Point<number, number>,
        current: Point<number, number>
      ): Point<number, number> => {
        return prev.y > current.y ? prev : current;
      }
    );

    return {
      startedDrinkingAt: {
        time: timeSeries[0].x,
        bac: 0
      },
      currentState: {
        time: new Date().getTime(),
        bac: this.bloodAlcoholContent(timeSeries, soberPoint)
      },
      mostDrunkAt: {
        time: mostDrunkPoint.x,
        bac: mostDrunkPoint.y,
        alreadyPassed: mostDrunkPoint.x < Date.now()
      },
      soberAt: {
        time: soberPoint.x,
        bac: 0
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
