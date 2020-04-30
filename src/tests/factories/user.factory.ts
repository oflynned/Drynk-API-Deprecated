import { User, UserType } from '../../models/user.model';
import { name, internet, random } from 'faker';

export class UserFactory {
  private constructor() {}

  static getInstance(): UserFactory {
    return new UserFactory();
  }

  private static provider(): string {
    const providers = ['google', 'facebook', 'twitter'];
    return providers[Math.floor(Math.random() * providers.length)];
  }

  private static buildProperties(overrides?: Partial<UserType>): UserType {
    const firstName = name.firstName();
    const lastName = name.lastName();
    return {
      name: `${firstName} ${lastName}`,
      email: internet.email(firstName, lastName),
      providerOrigin: UserFactory.provider(),
      providerId: random.uuid(),
      ...overrides
    };
  }

  build(overrides?: Partial<UserType>): User {
    const properties = UserFactory.buildProperties(overrides);
    return new User().build(properties);
  }
}
