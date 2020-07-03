import { Response } from 'express';
import { Repository } from 'mongoize-orm';
import { Item } from './seeds/beer/item.model';
import { BadRequestError } from '../../infrastructure/errors';
import { SearchRequest } from './search.route';

export class SearchController {
  static async search(req: SearchRequest, res: Response): Promise<Response> {
    const query = req.query.title;
    if (!query || query.trim().length === 0) {
      throw new BadRequestError(
        'Query needs to be at least one character long'
      );
    }

    const items: Item[] = await Repository.with(Item).findMany({
      name: { $regex: query, $options: 'i' }
    });
    const results = items.map((item: Item) => item.toJson());
    return res.status(200).json(results);
  }
}
