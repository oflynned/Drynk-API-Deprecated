import { User } from './user.model';

describe('user', () => {
  describe('.name', () => {
    it('should require at least one character', async () => {
      const user = new User().build({
        name: '',
        email: 'test@email.com',
        providerOrigin: 'google',
        providerId: 'providerId'
      });
      await expect(user.validate()).rejects.toThrowError(/is not allowed to be empty/);
    });
  });

  describe('.email', () => {
    it('should require valid format', async () => {
      const user = new User().build({
        name: 'name',
        email: 'test@',
        providerOrigin: 'google',
        providerId: 'providerId'
      });
      await expect(user.validate()).rejects.toThrowError(/must be a valid email/);
    });
  });

  describe('.providerId', () => {
    it('should not accept any value', async () => {
      const user = new User().build({
        name: 'name',
        email: 'test@test.com',
        providerOrigin: 'google',
        providerId: ''
      });
      await expect(user.validate()).rejects.toThrowError(/is not allowed to be empty/);
    });
  });

  describe('.providerOrigin', () => {
    it('should not accept any value', async () => {
      const user = new User().build({
        name: 'name',
        email: 'test@test.com',
        providerOrigin: 'not provider',
        providerId: 'providerId'
      });
      await expect(user.validate()).rejects.toThrowError(/must be one of/);
    });

    test.each(['google', 'facebook', 'twitter'])
    ('should accept %s as a provider', async (provider: string) => {
      const user = new User().build({
        name: 'name',
        email: 'test@test.com',
        providerOrigin: provider,
        providerId: 'providerId'
      });
      await expect(user.validate()).resolves.toBeDefined();
    });
  });
});
