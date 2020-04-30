import { BaseDocument, BaseModelType, Schema } from 'mongoize-orm';

export interface PukeType extends BaseModelType {}

export class PukeSchema extends Schema<PukeType> {
  joiBaseSchema(): object {
    return {};
  }

  joiUpdateSchema(): object {
    return {};
  }
}

export class Puke extends BaseDocument<PukeType, PukeSchema> {
  joiSchema(): PukeSchema {
    return new PukeSchema();
  }
}
