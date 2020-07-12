import { Db, MongoClient } from 'mongodb';
import { Drink } from '../models/drink.model';

const collection = new Drink().collection();

export const up = async (db: Db, client?: MongoClient) => {
  await db.collection(collection).updateMany(
    {
      drinkName: 'Wine',
      drinkType: { $ne: 'wine' }
    },
    { $set: { drinkType: 'wine' } }
  );
};

export const down = async (db: Db, client?: MongoClient) => {
  // no need to revert this
};

// for mongo-migrate to still work with ts exports
module.exports = { up, down };
