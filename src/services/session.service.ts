import { Drink } from '../models/drink.model';
import { Repository } from 'mongoize-orm';
import { User } from '../models/user.model';
import { ONE_HOUR_IN_MS, ONE_MINUTE_IN_MS, Point } from '../common/helpers';
import { DigestiveSystem } from './digestive-system';

// based on these papers
// https://staff.fnwi.uva.nl/a.j.p.heck/Research/art/ICTMT8_2.pdf
// http://www.appstate.edu/~spruntwh/bac_ncctm.pdf
// https://staff.fnwi.uva.nl/a.j.p.heck/research/alcohol/lesson/pharmacokinetics.pdf
export class Session {
  private user: User;
  private digestiveSystem: DigestiveSystem;

  private constructor() {
  }

  static async getInstance() {
    return new Session().buildSession();
  }

  bloodAlcoholContent(timeSeries: Point<number, number>[], soberPoint: Point<number, number>): number {
    let closestPointInSeries: Point<number, number>;
    if (soberPoint.x < Date.now()) {
      closestPointInSeries = { x: Date.now(), y: 0 };
    } else {
      closestPointInSeries = timeSeries.filter((point: Point<number, number>) => {
        return point.x < Date.now() + (ONE_MINUTE_IN_MS / 2) && point.x > Date.now() - (ONE_MINUTE_IN_MS / 2);
      })[0];
    }

    return closestPointInSeries.y || 0;
  }

  async buildSession(): Promise<Session> {
    this.user = new User();
    this.digestiveSystem = new DigestiveSystem(this.user);
    return this;
  }

  async buildTimeSeries(query: object = {}): Promise<Point<number, number>[]> {
    const drinks: Drink[] = await Repository.with(Drink).findMany({ drinkName: 'Shame' });
    const timeOfLastDrink = drinks[drinks.length - 1].toJson().createdAt.getTime();
    let timestamps = [];
    let timePeriod = drinks[0].toJson().createdAt.getTime();

    while (timePeriod < timeOfLastDrink + 24 * ONE_HOUR_IN_MS) {
      timestamps.push(timePeriod);
      timePeriod += ONE_MINUTE_IN_MS;
    }

    const series: Point<number, number>[] = await Promise.all(
      timestamps.map(
        async (time: number): Promise<Point<number, number>> => {
          const drinksInTimeframe: Drink[] = drinks.filter((drink: Drink) => {
            const drinkAddedTime = drink.toJson().createdAt.getTime();
            const lowerBound = drinkAddedTime - ONE_MINUTE_IN_MS / 2;
            const upperBound = drinkAddedTime + ONE_MINUTE_IN_MS / 2;
            return time > lowerBound && time < upperBound;
          });

          this.digestiveSystem.digest(drinksInTimeframe);

          return {
            x: time,
            y: this.digestiveSystem.bloodAlcoholContent
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
}
