import { Entity, Index, Property } from 'mikro-orm';
import { Base } from '../../../models/entities/base.entity';

@Entity()
export class Alcohol extends Base {
  @Property({ columnType: 'decimal' })
  abv: number;

  @Index()
  @Property()
  name: string;

  @Property()
  style: string;

  @Property()
  type: string;

  constructor(abv: number, name: string, style: string, type: string) {
    super();
    this.abv = abv;
    this.name = name;
    this.style = style;
    this.type = type;
  }
}
