import { Response } from 'express';
import { ClientAppRequest } from '../infrastructure/middleware/authenticated.request';
import { HealthService } from '../services/health.service';
import { BadRequestError } from '../infrastructure/errors';

export class AppController {
  private healthService: HealthService = new HealthService();

  async isClientVersionPermitted(
    req: ClientAppRequest,
    res: Response
  ): Promise<Response> {
    const clientVersion = req.clientAppVersion;
    if (this.healthService.isClientCompatible(clientVersion)) {
      return res.status(200).send({
        clientVersion,
        minimumVersion: this.healthService.getMinimumCompatibleAppVersion()
      });
    }

    throw new BadRequestError('App version is too old, please update');
  }
}
