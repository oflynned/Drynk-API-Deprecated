import { bootstrapMikro } from '../../config/mikro-orm.config';
import { Alcohol } from '../../microservices/alcohol-store/entities/alcohol.entity';
import { EntityManager, EntityRepository, MikroORM } from 'mikro-orm';

export type Container = {
  orm: MikroORM;
  entityManager: EntityManager;
  alcoholRepository: EntityRepository<Alcohol>;
};

export class DependencyInjector {
  private container = {} as Container;

  async registerDependents(): Promise<DependencyInjector> {
    const orm = await bootstrapMikro();
    this.container.orm = orm;
    this.container.entityManager = orm.em;
    this.container.alcoholRepository = orm.em.getRepository(Alcohol);

    return this;
  }

  getContainer(): Container {
    return this.container;
  }
}
