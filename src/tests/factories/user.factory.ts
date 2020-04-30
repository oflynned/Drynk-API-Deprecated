import { User, UserType } from '../../models/user.model';
import { name, internet, random } from 'faker';

export class UserFactory {
  private constructor() {
  }

  static getInstance(): UserFactory {
    return new UserFactory();
  }

  build(overrides: Partial<UserType>): User {
    return new User().build(UserFactory.buildProperties(overrides));
  };

  private static provider(): string {
    const providers = ['google', 'facebook', 'twitter'];
    return providers[Math.floor(Math.random() * providers.length)];
  };

  private static buildProperties(overrides: Partial<UserType>): UserType {
    return {
      name: `${name.firstName()} ${name.lastName()}`,
      email: internet.email(),
      providerOrigin: UserFactory.provider(),
      providerId: random.uuid(),
      ...overrides
    };
  };

}
