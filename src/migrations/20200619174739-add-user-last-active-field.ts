import { User } from '../models/user.model';
import { InternalModelType } from 'mongoize-orm/dist/document/base-document/schema';

const collection = new User().collection();

module.exports = {
  async up(db: any, client: any) {
    const users = await db
      .collection(collection)
      .find({ lastActiveAt: { $exists: false } })
      .toArray();

    await Promise.all(
      users.map(async ({ _id, updatedAt, createdAt }: InternalModelType) => {
        const timestamp = updatedAt || createdAt;
        return db
          .collection(collection)
          .updateOne({ _id }, { $set: { lastActiveAt: timestamp } });
      })
    );
  },

  async down(db: any, client: any) {
    // irreversible migration
  }
};
