import { Drink } from '../models/drink.model';
import { Repository } from 'mongoize-orm';
import { User } from '../models/user.model';

// based on this research paper
// https://staff.fnwi.uva.nl/a.j.p.heck/Research/art/ICTMT8_2.pdf
export class Session {
  private static widmark(drink: Drink, user: User): number {
    // BAC = (ethanol of drink in grams / (widmark factor * weight in g)) - (metabolism rate * time in hours since drink)
    const bacEffect = ((drink.ethanolGrams() / (user.widmarkConstant * user.weight)) * 100) - (user.metabolismRate * drink.timeSinceDrink('HOURS').elapsedTime);
    return bacEffect < 0 ? 0 : bacEffect;
  }

  async calculateDrinkSeries(): Promise<object[]> {
    const user: User = new User();
    const drinks: Drink[] = await Repository.with(Drink).findAll();

    return drinks.map((drink: Drink): object => {
      const timeElapsedSinceDrink = drink.timeSinceDrink('HOURS');
      const ethanolGrams = drink.ethanolGrams();
      const ethanolMls = drink.ethanolVolume();

      return {
        intake: {
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
          widmark: Session.widmark(drink, user)
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
