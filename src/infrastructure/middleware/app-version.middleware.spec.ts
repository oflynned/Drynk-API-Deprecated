import { Response, NextFunction } from 'express';
import { checkClientVersion } from './app-version.middleware';

describe('App version', () => {
  const res: Response = {} as Response;

  it.skip('should call next', function() {});

  describe('when present', () => {
    it.skip('should be set value of clientAppVersion', function() {
      const req: any = {
        headers: { 'x-app-version': '1.0.0' }
      };
      const next: NextFunction = jest.fn();

      checkClientVersion(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.appClientVersion).toEqual(req.headers['x-app-version']);
    });
  });

  describe('when missing', () => {
    it.skip('should set value of clientAppVersion to 1.0.0', function() {
      const req: any = { headers: {} };
      const next: NextFunction = jest.fn();

      checkClientVersion(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.appClientVersion).toEqual('1.0.0');
    });
  });
});
