import {
  EntityManager,
  EntityRepository,
  FilterQuery,
  QueryOrder
} from 'mikro-orm';
import { Alcohol } from '../microservices/alcohol-store/entities/alcohol.entity';

export class AlcoholService {
  constructor(
    private readonly repo: EntityRepository<Alcohol>
  ) {
  }

  async findMany(query: FilterQuery<Alcohol>): Promise<Alcohol[]> {
    return this.repo.find(query);
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
