const UserModel = require('../src/models/user.model').User;
const collection = new UserModel().collection();

module.exports = {
  async up(db, client) {
    // already onboarded users with no updated at timestamp
    const users = await db
      .collection(collection)
      .find({
        updatedAt: undefined,
        weight: { $exists: true },
        height: { $exists: true },
        sex: { $exists: true }
      })
      .toArray();

    await Promise.all(
      users.map(async ({ _id, createdAt }) => {
        return db
          .collection(collection)
          .updateOne({ _id }, { $set: { updatedAt: createdAt } });
      })
    );
  },

  async down(db, client) {}
};
