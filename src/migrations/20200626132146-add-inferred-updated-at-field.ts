import { Drink } from '../models/drink.model';
import { InternalModelType } from 'mongoize-orm/dist/document/base-document/schema';

const collection = new Drink().collection();

module.exports = {
  async up(db: any, client: any) {
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
      users.map(async ({ _id, createdAt }: InternalModelType) => {
        return db
          .collection(collection)
          .updateOne({ _id }, { $set: { updatedAt: createdAt } });
      })
    );
  },

  async down(db: any, client: any) {
  }
};
