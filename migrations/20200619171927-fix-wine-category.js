const DrinkModel = require('../src/models/drink.model').Drink;
const collection = new DrinkModel().collection();

module.exports = {
  async up(db, client) {
    await db.collection(collection).updateMany(
      {
        drinkName: 'Wine',
        drinkType: { $ne: 'wine' }
      },
      { $set: { drinkType: 'wine' } }
    );
  },

  async down(db, client) {
    // no need to revert this
  }
};
