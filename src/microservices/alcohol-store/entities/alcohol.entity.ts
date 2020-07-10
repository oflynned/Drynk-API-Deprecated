import { Entity, Index, Property, Unique } from 'mikro-orm';
import { Base } from '../../../models/entities/base.entity';

@Entity()
export class Alcohol extends Base {
  @Property({ columnType: 'decimal' })
  abv: number;

  @Index()
  @Property()
  name: string;

  @Property()
  type: string;

  constructor(abv: number, name: string, type: string) {
    super();
    this.abv = abv;
    this.name = name;
    this.type = type;
  }
}
