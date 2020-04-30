import Server from '../../../infrastructure/server';
import { agent } from 'supertest';
import { UserFactory } from '../../factories/user.factory';
import {
  bindGlobalDatabaseClient,
  InMemoryClient,
  Repository
} from 'mongoize-orm';
import { User } from '../../../models/user.model';

const request = agent(new Server().build().app);
const endpoint = '/users';

describe(endpoint, () => {
  let client: InMemoryClient;

  beforeAll(async () => {
    client = await new InMemoryClient().connect();
    await bindGlobalDatabaseClient(client);
  });

  beforeEach(async () => {
    await client.dropDatabase();
  });

  afterEach(async () => {
    await client.dropDatabase();
  });

  afterAll(async () => {
    await client.close();
  });

  describe('/', () => {
    describe('POST', () => {
      const payload = UserFactory.getInstance().build();

      describe('when user does not exist', () => {
        it('should not contain any users', async () => {
          await expect(Repository.with(User).count()).resolves.toEqual(0);
        });

        it('should create user', async () => {
          // TODO mock firebase middleware
          const response = await request.post(endpoint).send(payload);
          expect(response.status).toEqual(201);
        });
      });
    });
  });
});
