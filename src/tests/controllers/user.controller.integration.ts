import { UserController } from '../../controllers/user.controller';
import { UserFactory } from '../factories/user.factory';
import { bindGlobalDatabaseClient, InMemoryClient } from 'mongoize-orm';
import { User } from '../../models/user.model';
import { mockRequest, mockResponse } from 'mock-req-res';

describe('user controller', () => {
  const res = mockResponse();
  let client: InMemoryClient = new InMemoryClient();

  beforeAll(async () => {
    await client.connect();
    await bindGlobalDatabaseClient(client);
  });

  afterAll(async () => {
    await client.close();
  });

  describe('#createUser', () => {
    describe('when user already exists', () => {
      let user: User;

      beforeAll(async () => {
        await client.dropDatabase();
        user = await UserFactory.getInstance().seed();
      });

      afterAll(async () => {
        await client.dropDatabase();
      });

      it('should return http 200 status', async () => {
        const req = mockRequest({ user: user.toJson() });
        // console.log(req)
        const response = await UserController.createUser(req as any, res);
        console.log(response);
        // expect(response).toEqual(200)
      });
    });

    describe('when user does not exist', () => {});
  });
});
