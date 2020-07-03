// @ts-ignore
import { up } from './20200619171927-fix-wine-category.ts';
import { bindGlobalDatabaseClient, InMemoryClient } from 'mongoize-orm';
import { DrinkFactory } from '../factories/drink.factory';
import { Drink } from '../models/drink.model';

describe('20200619171927-fix-wine-category', () => {
  const factory: DrinkFactory = new DrinkFactory();

  describe('up', () => {
    let client: InMemoryClient = new InMemoryClient();
    let drinks: Drink[];

    beforeAll(async () => {
      await bindGlobalDatabaseClient(client);
    });

    beforeEach(async () => {
      await client.dropDatabase();
      await factory.seed({ drinkName: 'Wine', drinkType: 'spirit' });

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
      expect(drinks.length).toEqual(1);
      expect(drinks[0].toJson().drinkType).toEqual('wine');
    });
  });
});
