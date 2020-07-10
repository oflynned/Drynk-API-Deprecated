import { seedBeers } from './seeds/beer/beer.seed';
import { DependencyInjector } from '../../infrastructure/dependency-injector';

const seed = async () => {
  const di = await new DependencyInjector().registerDependents();

  // TODO remove this and ensure some consistency
  // await di.getContainer().orm.getSchemaGenerator().dropSchema();

  // ensure tables exist
  // await di.getContainer().orm.getSchemaGenerator().createSchema(false)

  try {
    console.log('Starting seed');
    await seedBeers(di.getContainer());
  } catch (e) {
    console.error(e);
  } finally {
    await di.getContainer().orm.close();
    console.log('Seeding complete!');
  }

  process.exit(0);
};

(async () => seed())();
