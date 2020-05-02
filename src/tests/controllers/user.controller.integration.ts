import { UserController } from '../../controllers/user.controller';
import { User } from '../../models/user.model';
import { UserFactory } from '../factories/user.factory';
import {
  bindGlobalDatabaseClient,
  InMemoryClient,
  Repository
} from 'mongoize-orm';
import { BadRequestError } from '../../infrastructure/errors';

const mockRequest = (user: User, request: object): object => {
  return { provider: { providerId: user.toJson().providerId }, ...request };
};

const mockResponse = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('user controller', () => {
  const client: InMemoryClient = new InMemoryClient();
  const factory: UserFactory = UserFactory.getInstance();

  let req: any;
  let res: any;

  beforeAll(async () => {
    await client.connect();
    await bindGlobalDatabaseClient(client);
    await client.dropDatabase();
  });

  afterAll(async () => {
    await client.dropDatabase();
    await client.close();
  });

  describe('#createUser', () => {
    describe('when payload is valid', () => {
      beforeAll(async () => {
        const user: User = await factory.build();
        req = mockRequest(user, { body: { ...user.toJson() } });
        res = mockResponse();
        await UserController.createUser(req, res);
      });

      it('should return 201', () => {
        expect(res.status).toHaveBeenCalledWith(201);
      });

      it('should create user', async () => {
        await expect(Repository.with(User).count()).resolves.toEqual(1);
      });
    });

    describe('when payload is invalid', () => {
      beforeAll(async () => {
        const user: User = await factory.build();
        req = mockRequest(user, { body: {} });
        res = mockResponse();
      });

      it('should throw BadRequestError', async () => {
        await expect(UserController.createUser(req, res)).rejects.toThrow(
          BadRequestError.name
        );
      });
    });
  });
});
