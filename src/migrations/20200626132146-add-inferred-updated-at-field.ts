import { Db, MongoClient } from 'mongodb';
import { Drink } from '../models/drink.model';
import { User } from '../models/user.model';

const collection = new Drink().collection();

module.exports = {
  async up(db: Db, client?: MongoClient) {
    // already onboarded users with no updated at timestamp
    const users = await db
      .collection(collection)
      .find({
        updatedAt: undefined,
        weight: { $exists: true },
        height: { $exists: true },
        sex: { $exists: true },
        unit: { $exists: true }
      })
      .toArray();

    await Promise.all(
      users.map(async (user: User) => {
        const { _id, createdAt } = user.toJson();
        return db
          .collection(collection)
          .updateOne({ _id }, { $set: { updatedAt: createdAt } });
      })
    );
  },

  async down(db: Db, client?: MongoClient) {}
};
