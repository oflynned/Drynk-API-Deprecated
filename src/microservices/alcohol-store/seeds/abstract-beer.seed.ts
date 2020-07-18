import { Alcohol } from '../entities/alcohol.entity';
import { EntityManager, EntityRepository } from 'mikro-orm';
import { Container } from '../../../infrastructure/dependency-injector';

export abstract class AbstractBeerSeed {
  abstract async run(di: Container): Promise<void>;

  async persist(
    beers: object[],
    repository: EntityRepository<Alcohol>,
    entityManager: EntityManager
  ): Promise<void> {
    await Promise.all(
      beers.map(async ({ abv, name, style, type }: any) => {
        if ((await repository.count({ name })) === 0) {
          const alcohol = new Alcohol(abv, String(name), style, type);
          entityManager.persistLater(alcohol);
        }
      })
    );

    await entityManager.flush();
  }
}
