import { Drink } from '../models/drink.model';
import { PopularDrink } from '../models/popular-drink';
import { Repository } from 'mongoize-orm';

export class DrinkService {
  async getPopularBeers(): Promise<PopularDrink[]> {
    return Repository.with(PopularDrink).findMany({});
  }

  async aggregatePopularBeers(): Promise<{ name: string; count: number }[]> {
    const drinks: Drink[] = await Repository.with(Drink).findMany({
      drinkName: { $nin: ['Beer', 'Wine', 'Spirit'] },
      drinkType: { $eq: 'beer' }
    });

    const drinkOccurrences = drinks.reduce((total: any, drink: Drink) => {
      if (!total[drink.toJson().drinkName]) {
        total[drink.toJson().drinkName] = 1;
      } else {
        total[drink.toJson().drinkName] = total[drink.toJson().drinkName] + 1;
      }

      return total;
    }, {});

    const occurrencesList: { name: string; count: number }[] = [];
    for (const drink in drinkOccurrences) {
      occurrencesList.push({ name: drink, count: drinkOccurrences[drink] });
    }
    occurrencesList.sort((a, b) => b.count - a.count);

    return occurrencesList;
  }
}
