import { Drink } from '../models/drink.model';

const collection = new Drink().collection();

module.exports = {
  async up(db: any, client: any) {
    await db.collection(collection).updateMany(
      {
        drinkName: { $in: ['ROSE', 'Rose', 'Pinot Blanc', 'Crémant d\'Alsace'] }
      },
      { $set: { drinkType: 'wine' } }
    );
  },

  async down(db: any, client: any) {
    // no need to revert this
  }
};
