import { UserFactory } from '../factories/user.factory';
import { Sex } from '../common/helpers';

describe('user model', () => {
  const factory: UserFactory = UserFactory.getInstance();

  describe('#save', () => {
    it('should be validated', async () => {
      await expect(factory.build().validate()).resolves.toBeDefined();
    });

    describe('.name', () => {
      it('should require at least one character', async () => {
        await expect(
          factory.build({ name: '' }).validate()
        ).rejects.toThrowError(/is not allowed to be empty/);
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

    describe('.height', () => {
      it('should not exist on build', async () => {
        await expect(
          factory.build({ height: 0 }).validate()
        ).resolves.not.toHaveProperty('height');
      });
    });

    describe('.weight', () => {
      it('should not exist on build', async () => {
        await expect(
          factory.build({ weight: 0 }).validate()
        ).resolves.not.toHaveProperty('weight');
      });
    });

    describe('.sex', () => {
      it('should not exist on build', async () => {
        await expect(
          factory.build({ sex: 'male' } as object).validate()
        ).resolves.not.toHaveProperty('weight');
      });
    });
  });

  describe('#update', () => {
    describe('.height', () => {
      it('should require at least 1', async () => {
        expect(
          factory
            .build()
            .joiSchema()
            .validateUpdate({ height: 0 }).error.details[0].message
        ).toMatch(/must be larger than or equal to 1/);
      });

      it('should be below 1000', async () => {
        expect(
          factory
            .build()
            .joiSchema()
            .validateUpdate({ height: 1000 }).error.details[0].message
        ).toMatch(/must be less than or equal to 999/);
      });
    });

    describe('.weight', () => {
      it('should require at least 1', async () => {
        expect(
          factory
            .build()
            .joiSchema()
            .validateUpdate({ weight: 0 }).error.details[0].message
        ).toMatch(/must be larger than or equal to 1/);
      });

      it('should be below 1000', async () => {
        expect(
          factory
            .build()
            .joiSchema()
            .validateUpdate({ weight: 1000 }).error.details[0].message
        ).toMatch(/must be less than or equal to 999/);
      });
    });

    describe('.sex', () => {
      test.each(['male', 'female'])(
        'should accept %s as a provider',
        async (sex: Sex) => {
          expect(
            factory
              .build()
              .joiSchema()
              .validateUpdate({ sex: sex })
          ).toBeDefined();
        }
      );

      it('should require valid sex', async () => {
        await expect(
          factory
            .build()
            .joiSchema()
            .validateUpdate({ sex: 'not a sex' } as object).error.details[0]
            .message
        ).toMatch(/must be one of/);
      });
    });
  });
});
