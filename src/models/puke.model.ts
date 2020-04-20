import { BaseDocument, BaseModelType, Joi, Schema } from 'mongoize-orm';

export interface PukeType extends BaseModelType {
  sessionId: string;
}

export class PukeSchema extends Schema<PukeType> {
  joiBaseSchema(): object {
    return {
      sessionId: Joi.string().required()
    };
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
