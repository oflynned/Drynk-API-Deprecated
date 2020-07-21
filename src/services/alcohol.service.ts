import { EntityRepository, QueryOrder } from 'mikro-orm';
import { Alcohol } from '../microservices/alcohol-store/entities/alcohol.entity';

export class AlcoholService {
  private readonly repo: EntityRepository<Alcohol>;

  constructor(repo: EntityRepository<Alcohol>) {
    this.repo = repo;
  }

  async findPopular(popularDrinks: { name: string, count: number }[]): Promise<Alcohol[]> {
    const items = await Promise.all(
      popularDrinks.map(
        async (item): Promise<Alcohol[]> =>
          this.findByName(item.name))
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
