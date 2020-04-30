import { UserFactory } from '../factories/user.factory';

describe('user', () => {
  const factory: UserFactory = UserFactory.getInstance();

  it('should be validated', async () => {
    await expect(factory.build().validate()).resolves.toBeDefined();
  });

  describe('.name', () => {
    it('should require at least one character', async () => {
      await expect(factory.build({ name: '' }).validate()).rejects.toThrowError(
        /is not allowed to be empty/
      );
    });
  });

  describe('.email', () => {
    it('should require valid format', async () => {
      await expect(
        factory.build({ email: 'test@' }).validate()
      ).rejects.toThrowError(/must be a valid email/);
    });
  });

  describe('.providerId', () => {
    it('should not accept any value', async () => {
      await expect(
        factory.build({ providerId: '' }).validate()
      ).rejects.toThrowError(/is not allowed to be empty/);
    });
  });

  describe('.providerOrigin', () => {
    it('should not accept any value', async () => {
      await expect(
        factory.build({ providerOrigin: 'not a provider' }).validate()
      ).rejects.toThrowError(/must be one of/);
    });

    test.each(['google', 'facebook', 'twitter'])(
      'should accept %s as a provider',
      async (provider: string) => {
        await expect(
          factory.build({ providerOrigin: provider }).validate()
        ).resolves.toBeDefined();
      }
    );
  });

  describe('.height', () => {
    it('should require at least 1', async () => {
      await expect(
        factory.build({ height: 0 }).validate()
      ).rejects.toThrowError(/must be larger than or equal to 1/);
    });
  });

  describe('.weight', () => {
    it('should require at least 1', async () => {
      await expect(
        factory.build({ weight: 0 }).validate()
      ).rejects.toThrowError(/must be larger than or equal to 1/);
    });
  });

  describe('.sex', () => {
    test.each(['male', 'female'])(
      'should accept %s as a provider',
      async (sex: string) => {
        await expect(
          factory.build({ sex: sex } as object).validate()
        ).resolves.toBeDefined();
      }
    );

    it('should require at least 1', async () => {
      await expect(
        factory.build({ sex: 'not a sex' } as object).validate()
      ).rejects.toThrowError(/must be one of/);
    });
  });
});
