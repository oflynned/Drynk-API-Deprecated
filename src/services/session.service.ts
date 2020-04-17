import { Drink } from '../models/drink.model';
import { Repository } from 'mongoize-orm';
import { User } from '../models/user.model';

// based on this research paper
// https://staff.fnwi.uva.nl/a.j.p.heck/Research/art/ICTMT8_2.pdf
export class Session {
  private readonly PEAK_BAC_EMPTY_STOMACH = 45;
  private readonly PEAK_BAC_NORMAL_STOMACH = 60;
  private readonly PEAK_BAC_FULL_STOMACH = 75;

  private static widmark(drink: Drink, user: User, decay: boolean = true): number {
    // BAC = (D / (r * W) * 100) - (β * t)
    // BAC = (ethanol of drink in grams / (widmark factor * weight in g) * 100) - (metabolism rate * time in hours since drink)
    const elapsedTime = decay ? drink.timeSinceDrink('HOURS').elapsedTime : 0;
    const bloodAlcoholContentFromDrink = ((drink.ethanolGrams() / (user.widmarkConstant * user.weight('G').value)) * 100) - (user.metabolismRate * elapsedTime);
    return Math.max(0, bloodAlcoholContentFromDrink);
  }

  private static widmarkTimeToSober(drink: Drink, user: User, decay: boolean): number {
    const peakBac = Session.widmark(drink, user, decay);
    return peakBac / user.metabolismRate;
  }

  private static wagner(drink: Drink, user: User): number {
    return 0;
  }

  private static pieters(drink: Drink, user: User): number {
    return 0;
  }

  async calculateDrinkSeries(): Promise<object[]> {
    const user: User = new User();
    const drinks: Drink[] = await Repository.with(Drink).findAll();

    return drinks.map((drink: Drink): object => {
      const timeElapsedSinceDrink = drink.timeSinceDrink('HOURS');
      const ethanolGrams = drink.ethanolGrams();
      const ethanolMls = drink.ethanolVolume();

      // TODO refactor this as it is not needed aside from calculating the widmark hit for the series since the user was last sober
      //      or over the drinks that are only affecting the user in the current session
      return {
        intake: {
          name: drink.toJson().drinkName,
          volume: `${drink.toJson().volume} ml`,
          abv: `${drink.toJson().abv}%`,
          abvPercentage: drink.toJson().abv / 100,
          ethanolMls,
          ethanolGrams
        },
        time: {
          ...timeElapsedSinceDrink
        },
        bloodAlcoholContent: {
          widmark: {
            maxBacEffect: Session.widmark(drink, user, false),
            maxTimeToSober: Session.widmarkTimeToSober(drink, user, false),
            currentBac: Session.widmark(drink, user, true),
            currentTimeToSober: Session.widmarkTimeToSober(drink, user, true)
          },
          wagner: Session.wagner(drink, user),
          pieters: Session.pieters(drink, user)
        }
      };
    });
  }

  async bloodAlcoholContent(): Promise<number> {
    const drinkSeries = await this.calculateDrinkSeries();

    if (drinkSeries.length === 0) {
      return 0;
    }

    return drinkSeries.map((item: any): number => item.bloodAlcoholContent.widmark)
      .reduce((a: number, b: number) => a + b, 0);
  }

  async isSober(): Promise<boolean> {
    return await this.bloodAlcoholContent() === 0;
  }
}
