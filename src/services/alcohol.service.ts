import { EntityRepository, QueryOrder } from 'mikro-orm';
import { Alcohol } from '../microservices/alcohol-store/entities/alcohol.entity';
import { PopularDrink } from '../models/popular-drink';

export class AlcoholService {
  private readonly repo: EntityRepository<Alcohol>;

  constructor(repo: EntityRepository<Alcohol>) {
    this.repo = repo;
  }

  async findPopular(popularDrinks: PopularDrink[]): Promise<Alcohol[]> {
    // TODO could improve this further by caching the alcohol drink ids as well for indexing
    const items = await Promise.all(
      popularDrinks.map(async (popularDrink: PopularDrink): Promise<Alcohol[]> =>
        this.findByName(popularDrink.toJson().name))
    );

    return items.reduce((total, current) => {
      const items = current.sort((a, b) => {
        if (a.name < b.name) {
          return 1;
        } else if (a.name > b.name) {
          return -1;
        } else {
          return 0;
        }
      });

      total = [...total, ...items];
      return total;
    }, []);

  }

  async findByName(query: string): Promise<Alcohol[]> {
    return this.repo
      .createQueryBuilder()
      .select('*')
      .where(`UPPER(name) LIKE ?`, [`%${query.toUpperCase()}%`])
      .orderBy({ name: QueryOrder.ASC })
      .execute();
  }
}
