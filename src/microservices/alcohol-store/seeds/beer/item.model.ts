import { BaseModelType, Joi, Schema } from 'mongoize-orm';

export interface ItemType extends BaseModelType {
  abv: number;
  name: string;
  type: string;
}
