import { UserController } from '../../controllers/user.controller';
import { User } from '../../models/user.model';
import { UserFactory } from '../factories/user.factory';
import {
  bindGlobalDatabaseClient,
  InMemoryClient,
  Repository
} from 'mongoize-orm';
import { BadRequestError } from '../../infrastructure/errors';

const mockRequest = (user: User, body: object = {}): object => {
  return {
    provider: {
      providerId: user.toJson().providerId
    },
    user,
    body
  };
};

const mockResponse = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('user controller', () => {
  const client: InMemoryClient = new InMemoryClient();
  const factory: UserFactory = UserFactory.getInstance();

  let req: any;
  let res: any;

  beforeAll(async () => {
    await bindGlobalDatabaseClient(client);
    await client.dropDatabase();
  });

  afterAll(async () => {
    await client.dropDatabase();
    await client.close();
  });

  describe('#createUser', () => {
    describe('when payload is valid', () => {
      let user: User;

      beforeAll(async () => {
        user = await factory.build();
        req = mockRequest(user, user.toJson());
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
      let user: User;

      beforeAll(async () => {
        user = await factory.build();
        req = mockRequest(user);
        res = mockResponse();
      });

      it('should throw BadRequestError', async () => {
        await expect(UserController.createUser(req, res)).rejects.toThrow(
          BadRequestError
        );
      });
    });
  });

  describe('#findUser', () => {
    let user: User;

    beforeAll(async () => {
      user = await factory.build();
      req = mockRequest(user);
      res = mockResponse();
      await UserController.findUser(req, res);
    });

    it('should return 200', async () => {
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return req user as json', async () => {
      expect(res.json).toHaveBeenCalledWith(user.toJson());
    });
  });

  describe('#updateUser', () => {
    describe('when payload is valid', () => {
      let user: User;

      beforeAll(async () => {
        user = await factory.seed();
        req = mockRequest(user, { weight: 90 });
        res = mockResponse();

        await UserController.updateUser(req, res);
      });

      it('should return 200', async () => {
        expect(res.status).toHaveBeenCalledWith(200);
      });

      it('should return updated user', async () => {
        expect(res.json).toHaveBeenCalledWith({ ...user.toJson(), weight: 90 });
      });
    });

    describe('when payload is invalid', () => {
      let user: User;

      beforeAll(async () => {
        user = await factory.seed();
        req = mockRequest(user, { weight: -1 });
        res = mockResponse();
      });

      it('should throw bad request error', async () => {
        await expect(UserController.updateUser(req, res)).rejects.toThrow(
          BadRequestError
        );
      });
    });
  });

  describe('#deleteUser', () => {
    let user: User;

    beforeAll(async () => {
      user = await factory.seed();
      req = mockRequest(user);
      res = mockResponse();

      await UserController.deleteUser(req, res);
    });

    it('should return 204', async () => {
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('should be soft deleted', async () => {
      const ref = await Repository.with(User).findById(user.toJson()._id);
      expect(ref.toJson().deleted).toBeTruthy();
      expect(ref.toJson().deletedAt).not.toBeNull();
    });
  });
});
