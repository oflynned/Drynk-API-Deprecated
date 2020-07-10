import { PrimaryKey, Property } from 'mikro-orm';
import { v4 as uuid } from 'uuid';

export abstract class Base {
  @PrimaryKey()
  id = uuid();

  @Property()
  createdAt = new Date();

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt: Date | null;

  @Property()
  deleted = false;

  @Property({ nullable: true })
  deletedAt: Date | null;
}