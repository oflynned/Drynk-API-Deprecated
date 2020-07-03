import { Db, MongoClient } from 'mongodb';
import { Drink } from '../models/drink.model';

const collection = new Drink().collection();

export const up = async (db: Db, client?: MongoClient) => {
  await db.collection(collection).updateMany(
    {
      drinkName: { $in: ['ROSE', 'Rose', 'Pinot Blanc', "Crémant d'Alsace"] }
    },
    { $set: { drinkType: 'wine' } }
  );
};

export const down = async (db: Db, client?: MongoClient) => {};

module.exports = { up, down };
