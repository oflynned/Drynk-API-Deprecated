import { Drink, DrinkType } from '../models/drink.model';
import { commerce, random } from 'faker';

export class DrinkFactory {
  private static drinkType(): string {
    const providers = ['beer', 'wine', 'cocktail', 'spirit'];
    return providers[Math.floor(Math.random() * providers.length)];
  }

  private static buildProperties(overrides?: Partial<DrinkType>): DrinkType {
    return {
      ...({
        drinkName: commerce.productName(),
        drinkType: this.drinkType(),
        abv: random.number({ min: 1, max: 99 }),
        volume: random.number({ min: 35, max: 568 }),
        sessionId: random.uuid()
      } as DrinkType),
      ...overrides
    };
  }

  build(overrides?: Partial<DrinkType>): Drink {
    const properties = DrinkFactory.buildProperties(overrides);
    return new Drink().build(properties) as Drink;
  }

  async seed(overrides?: Partial<DrinkType>): Promise<Drink> {
    return this.build(overrides).save();
  }
}
