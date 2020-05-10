import { DrinkFactory } from '../factories/drink.factory';

describe('drink model', () => {
  const factory: DrinkFactory = DrinkFactory.getInstance();

  it('should be validated', async () => {
    await expect(factory.build().validate()).resolves.toBeDefined();
  });

  describe('.drinkName', () => {
    it('should allow any drink name', async () => {
      await expect(
        factory.build({ drinkName: 'Tripel Karmeliet' }).validate()
      ).resolves.toBeDefined();
    });

    it('should require at least one character', async () => {
      await expect(
        factory.build({ drinkName: '' }).validate()
      ).rejects.toThrowError(/is not allowed to be empty/);
    });
  });

  describe('.abv', () => {
    it('should be above 0%', async () => {
      await expect(factory.build({ abv: -1 }).validate()).rejects.toThrowError(
        /must be larger than or equal to 0/
      );
    });

    it('should not be above 100%', async () => {
      await expect(factory.build({ abv: 101 }).validate()).rejects.toThrowError(
        /must be less than or equal to 100/
      );
    });
  });

  describe('.volume', () => {
    it('should be above 0ml', async () => {
      await expect(
        factory.build({ volume: 0 }).validate()
      ).rejects.toThrowError(/must be larger than or equal to 1/);
    });
  });

  describe('.sessionId', () => {
    it('should be uuid v4 format', async () => {
      await expect(
        factory.build({ sessionId: 'asdf' }).validate()
      ).rejects.toThrowError(/must be a valid GUID/);
    });
  });
});
