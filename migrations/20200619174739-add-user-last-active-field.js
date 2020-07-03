const UserModel = require('../src/models/user.model').User;
const collection = new UserModel().collection();

module.exports = {
  async up(db, client) {
    const users = await db
      .collection(collection)
      .find({ lastActiveAt: { $exists: false } })
      .toArray();
    await Promise.all(
      users.map(async ({ _id, updatedAt, createdAt }) => {
        const timestamp = updatedAt || createdAt;
        return db
          .collection(collection)
          .updateOne({ _id }, { $set: { lastActiveAt: timestamp } });
      })
    );
  },

  async down(db, client) {
    // irreversible migration
  }
};
