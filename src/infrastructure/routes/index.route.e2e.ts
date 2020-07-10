import Server from '../server';
import { agent } from 'supertest';
import { Container } from '../dependency-injector';

const mockDi: Container = {
  orm: {} as any,
  entityManager: {} as any,
  alcoholRepository: {} as any
};

const request = agent(new Server().build(mockDi).app);

describe('/health', () => {
  describe('GET', () => {
    it('should respond to health check', async () => {
      const response = await request.get('/health');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ ping: 'pong' });
    });
  });
});
