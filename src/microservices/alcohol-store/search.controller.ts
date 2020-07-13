import { Response } from 'express';
import { BadRequestError } from '../../infrastructure/errors';
import { SearchRequest } from './search.route';
import { AlcoholService } from '../../services/alcohol.service';
import { EntityManager, EntityRepository } from 'mikro-orm';
import { Alcohol } from './entities/alcohol.entity';

export class SearchController {
  private alcoholService: AlcoholService;

  constructor(repo: EntityRepository<Alcohol>) {
    this.alcoholService = new AlcoholService(repo);
  }

  async get(req: SearchRequest, res: Response): Promise<Response> {
    const query = req.query.title;
    if (!query || query.trim().length === 0) {
      throw new BadRequestError(
        'Query needs to be at least one character long'
      );
    }

    const items = await this.alcoholService.findByName(query);
    return res.status(200).json(items);
  }
}
