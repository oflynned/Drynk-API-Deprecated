import { Drink } from '../models/drink.model';

const collection = new Drink().collection();

module.exports = {
  async up(db: any, client: any) {
    await db.collection(collection).updateMany(
      {
        drinkName: 'Wine',
        drinkType: { $ne: 'wine' }
      },
      { $set: { drinkType: 'wine' } }
    );
  },

  async down(db: any, client: any) {
    // no need to revert this
  }
};
