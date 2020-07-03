import { Db, MongoClient } from 'mongodb';
import { Drink } from '../models/drink.model';

const collection = new Drink().collection();

module.exports = {
  async up(db: Db, client?: MongoClient) {
    await db.collection(collection).updateMany(
      {
        drinkName: { $in: ['ROSE', 'Rose', 'Pinot Blanc', 'Crémant d\'Alsace'] }
      },
      { $set: { drinkType: 'wine' } }
    );
  },

  async down(db: Db, client?: MongoClient) {
    // no need to revert this
  }
};
