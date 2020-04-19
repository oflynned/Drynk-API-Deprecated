import { Drink } from '../models/drink.model';
import { Repository } from 'mongoize-orm';
import { User } from '../models/user.model';
import { MeasureType, ONE_MINUTE_IN_MS, Point, sum, Time } from '../common/helpers';
import { expectedBacFromSingularDrink } from './widmark.service';
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
  private readonly user: User = new User();
  private drinks: Drink[] = [];
  private digestiveSystem: DigestiveSystem = new DigestiveSystem();

  // TODO remove this, it should be expressed by a closed system instead of singularly per drink
  private drinkEffects: DrinkEffect[] = [];

  private constructor() {
  }

  static async getInstance() {
    return new Session().buildSession();
  }

  static isPeakPassed(drink: Drink, user: User): boolean {
    return (
      Date.now() - drink.toJson().createdAt.getTime() >
      user.absorptionHalflife('MS').value
    );
  }

  static bloodAlcoholContentOfSeries(drinkEffects: DrinkEffect[]): number {
    if (drinkEffects.length === 0) {
      return 0;
    }

    // return drinkEffects[0].currentBacFromDrink;
    return sum(drinkEffects.map((item: DrinkEffect) => item.currentBacFromDrink));
  }

  static async calculateDrinkSeriesAtGivenTime(user: User, drinks: Drink[], reportedTime: number): Promise<DrinkEffect[]> {
    // issue lies here, each drink is considered singularly instead of as a whole intake/elimination system
    return drinks.map(
      (drink: Drink): DrinkEffect => {
        return {
          timeToPeakBacEffect: drink.timeToPeakEffect(user, 'HOURS'),
          peakBacEffectWasPassed: Session.isPeakPassed(drink, user),
          currentBacFromDrink: expectedBacFromSingularDrink(drink, user, { reportBac: 'FORCED', reportedTime }),
          maxPredictedBacFromDrink: expectedBacFromSingularDrink(drink, user, { reportBac: 'MAX' })
        };
      }
    );
  }

  bloodAlcoholContent(): number {
    if (this.drinkEffects.length === 0) {
      return 0;
    }

    return sum(this.drinkEffects.map((item: DrinkEffect) => item.currentBacFromDrink));
  }

  async buildSession(): Promise<Session> {
    this.drinkEffects = await this.calculateDrinkSeries();
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
      timestamps.map(async (time: number): Promise<Point<number, number>> => {
        const drinksIntakenAtTime: Drink[] = drinks.filter((drink: Drink) => drink.toJson().createdAt.getTime() < time);
        const drinkEffects: DrinkEffect[] = await Session.calculateDrinkSeriesAtGivenTime(this.user, drinksIntakenAtTime, time);
        const reportedBacForTimestamp = await Session.bloodAlcoholContentOfSeries(drinkEffects);
        return { x: time, y: reportedBacForTimestamp };
      })
    );

    return series.filter((point: Point<number, number>, index: number): boolean => {
      if (index === 0) {
        return true;
      }

      return point.y > 0;
    });
  }

  async estimateEventTimes(): Promise<object> {
    const timeSeries = await this.buildTimeSeries();
    const mostDrunkPoint: Point<number, number> = timeSeries.reduce((
      prev: Point<number, number>, current: Point<number, number>): Point<number, number> => {
      return (prev.y > current.y) ? prev : current;
    });
    const soberPoint: Point<number, number> = timeSeries
      .filter((point, index) => index !== 0)
      .reduce((
        prev: Point<number, number>, current: Point<number, number>): Point<number, number> => {
        return (prev.y > 0 && current.y === 0) ? current : prev;
      });

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

  private async calculateDrinkSeries(): Promise<DrinkEffect[]> {
    // TODO change this as a collection should be kept of the last time a user was sober, the generated series graphs, etc
    //      then a look up can just be done instead of calculating everything and having to know about the drinks entered
    //      where the entire session can be regenerated on a change (drink added, removed, changed)
    this.drinks = await Repository.with(Drink).findAll();
    return Session.calculateDrinkSeriesAtGivenTime(this.user, this.drinks, Date.now());
  }
}
