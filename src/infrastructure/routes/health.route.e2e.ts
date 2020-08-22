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
  describe('/', () => {
    describe('GET', () => {
      it('should respond to health check', async () => {
        const response = await request.get('/health');
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ ping: 'pong' });
      });
    });
  });

  describe('/app-version', () => {
    describe('GET', () => {
      describe('when app version is too old', () => {
        it('should throw error ', async () => {
          const response = await request
            .get('/health/app-version')
            .set('x-app-version', '1.0.0');

          expect(response.status).toEqual(400);
        });
      });

      describe('when app version is modern', () => {
        it('should throw error ', async () => {
          const response = await request
            .get('/health/app-version')
            .set('x-app-version', '1.0.2');

          expect(response.status).toEqual(200);
        });
      });
    });
  });
});
