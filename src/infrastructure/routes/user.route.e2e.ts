import { agent } from 'supertest';
import Server from '../server';
import { UserFactory } from '../../factories/user.factory';
import {
  bindGlobalDatabaseClient,
  InMemoryClient,
  Repository
} from 'mongoize-orm';
import { User } from '../../models/user.model';

const request = agent(new Server().build().app);
const endpoint = '/users';

describe(endpoint, () => {
  let client: InMemoryClient = new InMemoryClient();

  beforeAll(async () => {
    await bindGlobalDatabaseClient(client);

    // TODO initialise mock firebase auth
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
      const payload = UserFactory.getInstance()
        .build()
        .toJson();

      describe('when user does not exist', () => {
        it('should not contain any users', async () => {
          await expect(Repository.with(User).count()).resolves.toEqual(0);
        });

        it.skip('should create a new user', async () => {
          // TODO mock firebase middleware & deal with custom headers
          // authorization: Bearer xyz (firebase token)
          // x-firebase-id: xyz
          // x-firebase-provider: xyz
          console.log(payload);

          const response = await request.post(endpoint).send(payload);
          expect(response.status).toEqual(201);
        });
      });
    });
  });
});
