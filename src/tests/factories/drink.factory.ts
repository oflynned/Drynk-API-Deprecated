import { Drink, DrinkType } from '../../models/drink.model';
import { random } from 'faker';

export class DrinkFactory {
  private constructor() {}

  static getInstance(): DrinkFactory {
    return new DrinkFactory();
  }

  private static drinkName(): string {
    const providers = ['beer', 'wine', 'cocktail', 'spirit'];
    return providers[Math.floor(Math.random() * providers.length)];
  }

  private static buildProperties(overrides?: Partial<DrinkType>): DrinkType {
    return {
      ...({
        drinkName: this.drinkName(),
        abv: random.number({ min: 1, max: 99 }),
        volume: random.number({ min: 35, max: 568 })
      } as DrinkType),
      ...overrides
    };
  }

  build(overrides?: Partial<DrinkType>): Drink {
    const properties = DrinkFactory.buildProperties(overrides);
    return new Drink().build(properties) as Drink;
  }
}
