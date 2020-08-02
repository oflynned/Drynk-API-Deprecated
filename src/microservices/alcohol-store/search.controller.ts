import { Request, Response } from 'express';
import { BadRequestError } from '../../infrastructure/errors';
import { SearchRequest } from './search.route';
import { AlcoholService } from '../../services/alcohol.service';
import { EntityRepository } from 'mikro-orm';
import { Alcohol } from './entities/alcohol.entity';
import { DrinkService } from '../../services/drink.service';

export class SearchController {
  private alcoholService: AlcoholService;
  private drinkService: DrinkService;

  constructor(repo: EntityRepository<Alcohol>) {
    this.alcoholService = new AlcoholService(repo);
    this.drinkService = new DrinkService();
  }

  async getPopular(req: Request, res: Response): Promise<Response> {
    const popularBeers = await this.drinkService.getPopularBeers();
    const items = await this.alcoholService.findPopular(popularBeers);
    // TODO limit this in the future to 10-20 items if the list gets large, as there are a lot of expensive queries here

    return res.status(200).json(items);
  }

  async get(req: SearchRequest, res: Response): Promise<Response> {
    const query = req.query.title || "";
    if (!query || query.trim().length === 0) {
      throw new BadRequestError(
        'Query needs to be at least one character long'
      );
    }

    const items = await this.alcoholService.findByName(query);
    return res.status(200).json(items);
  }
}
