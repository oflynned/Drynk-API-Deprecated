import { BaseDocument, BaseModelType, Joi, Schema } from 'mongoize-orm';
import { Point } from '../../common/helpers';

export interface TimelineType extends BaseModelType {
  sessionId: string;
  series: Point<number, number>[];
}

export class TimelineSchema extends Schema<TimelineType> {
  joiBaseSchema(): object {
    return {
      series: Joi.array()
        .items(
          Joi.object({
            x: Joi.number()
              .min(0)
              .required(),
            y: Joi.number()
              .min(0)
              .required()
          })
        )
        .min(1)
        .required(),
      sessionId: Joi.string()
        .uuid()
        .required()
    };
  }

  joiUpdateSchema(): object {
    return undefined;
  }
}

export class Timeline extends BaseDocument<TimelineType, TimelineSchema> {
  joiSchema(): TimelineSchema {
    return new TimelineSchema();
  }
}
