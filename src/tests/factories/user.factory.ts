import { User, UserType } from '../../models/user.model';
import { name, internet, random } from 'faker';

export class UserFactory {
  private constructor() {}

  static getInstance(): UserFactory {
    return new UserFactory();
  }

  private static sex(): string {
    const providers = ['male', 'female'];
    return providers[Math.floor(Math.random() * providers.length)];
  }

  private static buildProperties(overrides?: Partial<UserType>): UserType {
    const firstName = name.firstName();
    const lastName = name.lastName();
    return {
      ...({
        name: `${firstName} ${lastName}`,
        email: internet.email(firstName, lastName),
        providerId: random.uuid(),
        height: random.number({ min: 120, max: 200 }),
        weight: random.number({ min: 40, max: 150 }),
        sex: this.sex()
      } as UserType),
      ...overrides
    };
  }

  build(overrides?: Partial<UserType>): User {
    const properties = UserFactory.buildProperties(overrides);
    return new User().build(properties) as User;
  }

  async seed(overrides?: Partial<UserType>): Promise<User> {
    return this.build(overrides).save();
  }
}
