import { Db, MongoClient } from 'mongodb';
import { User } from '../models/user.model';

const collection = new User().collection();

module.exports = {
  async up(db: Db, client?: MongoClient) {
    const users = await db
      .collection(collection)
      .find({ lastActiveAt: { $exists: false } })
      .toArray();

    await Promise.all(
      users.map(async (user: User) => {
        const { _id, createdAt, updatedAt } = user.toJson();
        const timestamp = updatedAt || createdAt;
        return db
          .collection(collection)
          .updateOne({ _id }, { $set: { lastActiveAt: timestamp } });
      })
    );
  },

  async down(db: any, client?: any) {
    // irreversible migration
  }
};
