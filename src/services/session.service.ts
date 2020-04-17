import { Drink } from '../models/drink.model';
import { Repository } from 'mongoize-orm';
import { User } from '../models/user.model';
import { MeasureType, sum, Time } from '../common/helpers';

interface DrinkSeries {
  timeToPeakBacEffect: MeasureType<Time>;
  peakBacEffectWasPassed: boolean;
  maxPredictedBac: number;
  currentBac: number;
}

// based on this research paper
// https://staff.fnwi.uva.nl/a.j.p.heck/Research/art/ICTMT8_2.pdf
export class Session {
  private readonly user: User = new User();

  private constructor() {}

  private _drinkSeries: DrinkSeries[] = [];

  get drinkSeries(): DrinkSeries[] {
    return this._drinkSeries;
  }

  static async getInstance() {
    return new Session().buildSession();
  }

  // BAC = (D / (r * W) * 100) - (β * t)
  private static widmark(
    drink: Drink,
    user: User,
    decay: boolean = true
  ): number {
    // the max bac a drink has on someone is 0.75-1.25 hours
    // this peak value is always accessible by getting the user's food state at the time
    const waitTimeToPeakDrinkBac = user.timeToPeakDrinkEffect('HOURS').value;
    const elapsedTime = decay
      ? drink.timeSinceDrink('HOURS').value
      : waitTimeToPeakDrinkBac;

    // BAC = (ethanol of drink in grams / (widmark factor * weight in g) * 100) - (metabolism rate * time in hours since drink)
    const maxBacEffect =
      (drink.ethanolGrams() / (user.widmarkConstant * user.weight('G').value)) *
      100;
    if (elapsedTime < waitTimeToPeakDrinkBac) {
      return maxBacEffect * elapsedTime;
    }

    // after 1 hour, excretion starts and the max bac observed from the drink starts to decay
    const bloodAlcoholBacEffectFromDrink =
      maxBacEffect -
      user.metabolismRate * (elapsedTime - waitTimeToPeakDrinkBac);
    return Math.max(0, bloodAlcoholBacEffectFromDrink);
  }

  private static widmarkTimeToSober(peakBac: number, user: User): number {
    return peakBac / user.metabolismRate;
  }

  isPeakPassed(drink: Drink, user: User): boolean {
    return (
      Date.now() - drink.toJson().createdAt.getTime() >
      user.timeToPeakDrinkEffect('MS').value
    );
  }

  bloodAlcoholContent(): number {
    if (this._drinkSeries.length === 0) {
      return 0;
    }

    return sum(this._drinkSeries.map((item: DrinkSeries) => item.currentBac));
  }

  async buildSession(): Promise<Session> {
    this._drinkSeries = await this.calculateDrinkSeries();
    return this;
  }

  async timeToSober(): Promise<number> {
    if (this.drinkSeries.length === 0) {
      return 0;
    }

    const drinksBeingAbsorbed = this.drinkSeries.filter(
      (item: any) => !item.peakBacEffectWasPassed
    );
    const drinksBeingExcreted = this.drinkSeries.filter(
      (item: any) => item.peakBacEffectWasPassed
    );

    const timeToFullAbsorption = sum(
      drinksBeingAbsorbed.map(
        (drinkSeries: DrinkSeries) => drinkSeries.timeToPeakBacEffect.value
      )
    );
    const decayingBacUndigestedDrinks = sum(
      drinksBeingAbsorbed.map(
        (drinkSeries: DrinkSeries) => drinkSeries.maxPredictedBac
      )
    );
    const decayingBacDigestedDrinks = sum(
      drinksBeingExcreted.map(
        (drinkSeries: DrinkSeries) => drinkSeries.currentBac
      )
    );

    const maxPredictedBac =
      decayingBacDigestedDrinks + decayingBacUndigestedDrinks;
    return (
      Session.widmarkTimeToSober(maxPredictedBac, this.user) +
      timeToFullAbsorption
    );
  }

  async isSober(): Promise<boolean> {
    return (await this.bloodAlcoholContent()) === 0;
  }

  private async calculateDrinkSeries(): Promise<DrinkSeries[]> {
    const user: User = new User();
    const drinks: Drink[] = await Repository.with(Drink).findAll();

    return drinks.map(
      (drink: Drink): DrinkSeries => {
        // TODO refactor this as it is not needed aside from calculating the widmark hit for the series since the user was last sober
        //      or over the drinks that are only affecting the user in the current session
        return {
          timeToPeakBacEffect: drink.timeToPeakEffect(user, 'HOURS'),
          peakBacEffectWasPassed: this.isPeakPassed(drink, user),
          maxPredictedBac: Session.widmark(drink, user, false),
          currentBac: Session.widmark(drink, user, true)
        };
      }
    );
  }
}
