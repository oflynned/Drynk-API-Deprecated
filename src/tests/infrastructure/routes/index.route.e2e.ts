import Server from '../../../infrastructure/server';
import { agent } from 'supertest';

const request = agent(new Server().build().app);

describe('/', () => {
  describe('GET', () => {
    it('should respond healthy', async () => {
      const response = await request.get('/');
      expect(response.body).toEqual({ ping: 'pong' });
      expect(response.status).toEqual(200);
    });
  });
});
