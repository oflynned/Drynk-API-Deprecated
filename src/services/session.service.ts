import { Drink } from '../models/drink.model';
import { Repository } from 'mongoize-orm';
import { User } from '../models/user.model';
import { MeasureType, ONE_MINUTE_IN_MS, Point, Time } from '../common/helpers';
import { expectedBacFromEthanolMass } from './widmark.service';
import { DigestiveSystem } from './digestive-system';

interface DrinkEffect {
  timeToPeakBacEffect: MeasureType<Time>;
  peakBacEffectWasPassed: boolean;
  maxPredictedBacFromDrink: number;
  currentBacFromDrink: number;
}

interface BodySystem {
  intake: number;
  clearance: number;
}

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

  bloodAlcoholContent(): number {
    return expectedBacFromEthanolMass(
      this.digestiveSystem.activeEthanolInSystem(),
      this.user
    );
  }

  async buildSession(): Promise<Session> {
    this.user = new User();
    this.digestiveSystem = new DigestiveSystem(this.user);
    return this;
  }

  async buildTimeSeries(query: object = {}): Promise<Point<number, number>[]> {
    const drinks: Drink[] = await Repository.with(Drink).findMany(query);
    let timestamps = [];
    let timePeriod = drinks[0].toJson().createdAt.getTime();

    while (timePeriod < Date.now()) {
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
    const mostDrunkPoint: Point<number, number> = timeSeries.reduce(
      (
        prev: Point<number, number>,
        current: Point<number, number>
      ): Point<number, number> => {
        return prev.y > current.y ? prev : current;
      }
    );
    const soberPoint: Point<number, number> = timeSeries.filter((point, index) => {
      return index !== 0 && point.y === 0;
    })[0];

    return {
      startedDrinkingAt: {
        time: new Date(timeSeries[0].x).getTime(),
        bac: 0
      },
      currentState: {
        time: new Date().getTime(),
        bac: await this.bloodAlcoholContent(),
        hoursToSober: Math.max(0, new Date(soberPoint.x - Date.now()).getTime())
      },
      mostDrunkAt: {
        time: new Date(mostDrunkPoint.x).getTime(),
        bac: mostDrunkPoint.y,
        alreadyPassed: mostDrunkPoint.x < Date.now()
      },
      soberAt: {
        time: new Date(soberPoint.x).getTime(),
        bac: 0
      }
    };
  }
}
