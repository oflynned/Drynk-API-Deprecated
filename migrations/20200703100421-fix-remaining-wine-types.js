const DrinkModel = require('../dist/models/drink.model').Drink;
const collection = new DrinkModel().collection();

module.exports = {
  async up(db, client) {
    await db.collection(collection).updateMany(
      {
        drinkName: {$in: ["ROSE", "Rose", "Pinot Blanc", "Crémant d'Alsace"]},
      },
      { $set: { drinkType: 'wine' } }
    );
  },

  async down(db, client) {
    // no need to revert this
  }
};
