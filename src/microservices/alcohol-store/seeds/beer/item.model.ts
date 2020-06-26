import { BaseDocument, BaseModelType, Joi, Schema } from 'mongoize-orm';

export interface ItemType extends BaseModelType {
  abv: number;
  name: string;
  type: string;
}

class ItemSchema extends Schema<ItemType> {
  joiBaseSchema(): object {
    return {
      abv: Joi.number()
        .required()
        .min(0)
        .max(100),
      name: Joi.string().required(),
      type: Joi.string().required()
    };
  }

  joiUpdateSchema(): object {
    return undefined;
  }
}

export class Item extends BaseDocument<ItemType, ItemSchema> {
  joiSchema(): ItemSchema {
    return new ItemSchema();
  }
}
