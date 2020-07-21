import { Request, Response } from 'express';
import { BadRequestError } from '../../infrastructure/errors';
import { SearchRequest } from './search.route';
import { AlcoholService } from '../../services/alcohol.service';
import { EntityRepository } from 'mikro-orm';
import { Alcohol } from './entities/alcohol.entity';
import { Drink } from '../../models/drink.model';

export class SearchController {
  private alcoholService: AlcoholService;

  constructor(repo: EntityRepository<Alcohol>) {
    this.alcoholService = new AlcoholService(repo);
  }

  async getPopular(req: Request, res: Response): Promise<Response> {
    const drinks: Drink[] = await Drink.findMany({
      drinkName: { $nin: ['Beer', 'Wine', 'Spirit'] },
      drinkType: { $eq: 'beer' }
    });

    const drinkNames: string[] = drinks.map((drink: Drink) => drink.toJson().drinkName);
    const drinkOccurrences = drinkNames.reduce(
      (total: any, beerName) => {
        if (!total[beerName]) {
          total[beerName] = 1;
        } else {
          total[beerName] = total[beerName] + 1;
        }

        return total;
      }, {});

    const occurencesList: { name: string, count: number }[] = [];
    for (const drink in drinkOccurrences) {
      occurencesList.push({ name: drink, count: drinkOccurrences[drink] });
    }
    occurencesList.sort((a, b) => b.count - a.count);

    const items = await this.alcoholService.findPopular(occurencesList);
    return res.status(200).json(items);
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
