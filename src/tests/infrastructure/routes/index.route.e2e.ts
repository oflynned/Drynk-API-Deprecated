import Server from '../../../infrastructure/server';
import { agent } from 'supertest';

const request = agent(new Server().build().app);

describe('/', () => {
  describe('GET', () => {
    it('should respond to health check', async () => {
      const response = await request.get('/');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ ping: 'pong' });
    });
  });
});
