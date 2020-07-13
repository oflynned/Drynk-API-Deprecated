import { DependencyInjector } from '../../infrastructure/dependency-injector';
import { OpenBeerDatabaseSeed } from './seeds/open-beer';
import { CraftBeerDatabaseSeed } from './seeds/craft-beer';
import { KaggleDatabaseSeed } from './seeds/kaggle-beer';

const seed = async () => {
  const di = await new DependencyInjector().registerDependents();
  const container = di.getContainer();

  try {
    console.log('Starting seed');

    await container.alcoholRepository.nativeDelete({});

    await new OpenBeerDatabaseSeed().run(container);
    await new CraftBeerDatabaseSeed().run(container);
    await new KaggleDatabaseSeed().run(container);
  } catch (e) {
    console.error(e);
  } finally {
    await di.getContainer().orm.close();
    console.log('Seeding complete!');
  }

  process.exit(0);
};

(async () => seed())();
