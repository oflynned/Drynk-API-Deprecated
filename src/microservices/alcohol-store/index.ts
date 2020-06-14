import { seedBeers } from './seeds/beer/beer.seed';
import { Repository } from 'mongoize-orm';
import { Item } from './seeds/beer/item.model';
import { DatabaseHelper } from '../../common/database';
import { dbConfig } from '../../config/database.config';

const seed = async (): Promise<void> => {
  await DatabaseHelper.registerDatabase(dbConfig());

  console.log('Purging old data');
  await Repository.with(Item).hardDeleteMany({});

  console.log('Starting seed');
  await seedBeers();

  console.log('Seeding complete!');
};

(async () => seed())();