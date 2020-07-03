// @ts-ignore
import { up } from './20200703100421-fix-remaining-wine-types';
import { bindGlobalDatabaseClient, InMemoryClient } from 'mongoize-orm';
import { DrinkFactory } from '../factories/drink.factory';
import { Drink } from '../models/drink.model';

describe('20200703100421-fix-remaining-wine-types', () => {
  const factory: DrinkFactory = new DrinkFactory();

  describe('up', () => {
    let client: InMemoryClient = new InMemoryClient();
    let drinks: Drink[];

    beforeAll(async () => {
      await bindGlobalDatabaseClient(client);
    });

    beforeEach(async () => {
      await client.dropDatabase();
      await Promise.all([
        factory.seed({ drinkName: 'Crémant d\'Alsace', drinkType: 'spirit' }),
        factory.seed({ drinkName: 'ROSE', drinkType: 'spirit' }),
        factory.seed({ drinkName: 'Rose', drinkType: 'spirit' }),
        factory.seed({ drinkName: 'Pinot Blanc', drinkType: 'spirit' })
      ]);

      await up(client.withDb());
      drinks = await Drink.findMany();
    });

    afterEach(async () => {
      await client.dropDatabase();
    });

    afterAll(async () => {
      await client.close();
    });

    it('should rename drink type to wine', async () => {
      const categories = Array.from(
        new Set(drinks.map(drink => drink.toJson().drinkType))
      );

      expect(categories).toEqual(['wine']);
    });

    it('should keep drink name intact', async () => {
      const names = drinks.map(drink => drink.toJson().drinkName).sort();
      expect(names).toEqual(['Crémant d\'Alsace', 'Pinot Blanc', 'ROSE', 'Rose']);
    });
  });
});
