import { EntityManager, EntityRepository, FilterQuery, Repository } from 'mikro-orm';
import { Alcohol } from '../microservices/alcohol-store/entities/alcohol.entity';

export class AlcoholService {
  constructor(private readonly entityManager: EntityManager, private readonly repo: EntityRepository<Alcohol>) {
  }

  async findMany(query: FilterQuery<Alcohol>): Promise<Alcohol[]> {
    return this.repo.find(query);
  }

  async findByName(query: string): Promise<Alcohol[]> {
    return this.entityManager.createQueryBuilder(Alcohol)
      .select('*')
      .where(`UPPER(name) LIKE UPPER('%${query}%')`)
      .execute();
  }
}