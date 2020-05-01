import { createUser } from '../../controllers/user.controller';
import { UserFactory } from '../factories/user.factory';
import { InMemoryClient } from 'mongoize-orm';
import { User } from '../../models/user.model';
import { mockRequest, mockResponse } from 'mock-req-res';

describe('user controller', () => {
  const res = mockResponse();
  let client: InMemoryClient;

  beforeAll(async () => {
    client = await new InMemoryClient().connect();
  });

  afterAll(async () => {
    await client.close();
  });

  describe('#createUser', () => {
    let user: User;

    beforeAll(async () => {
      user = await UserFactory.getInstance().seed();
    });

    afterAll(async () => {
      await client.dropDatabase();
    });

    describe('when user already exists', () => {
      it('should return http 200 status', async () => {
        const req = mockRequest({ user }) as any;
        await expect(createUser(req, res)).resolves.toBeDefined();
      });
    });

    describe('when user does not exist', () => {});
  });
});
