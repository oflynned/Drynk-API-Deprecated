import {
  BaseDocument,
  BaseModelType,
  Joi,
  Repository,
  Schema
} from 'mongoize-orm';
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
  static async findBySessionIds(sessionIds: string[]): Promise<Timeline[]> {
    return Repository.with(Timeline).findMany({
      sessionId: { $in: sessionIds }
    });
  }

  joiSchema(): TimelineSchema {
    return new TimelineSchema();
  }

  dangerousPeaks(): Point<number, number>[] {
    const series = this.toJson().series;
    const peaks: Point<number, number>[] = [];

    // 2nd and 2nd last elements to ensure there is +1 and -1 available
    for (let i = 1; i < series.length - 1; i++) {
      // is bac above 0.15? roughly about the point someone starts being sloppy
      if (series[i].y >= 0.15) {
        // is it a local max?
        if (series[i].y > series[i - 1].y && series[i].y > series[i + 1].y) {
          peaks.push(series[i]);
          i += 2;
        }
      }
    }

    return peaks;
  }

  inflectionPoints(): Point<number, number>[] {
    const series = this.toJson().series;
    const peaks: Point<number, number>[] = [];

    // 2nd and 2nd last elements to ensure there is +1 and -1 available
    for (let i = 0; i < series.length; i++) {
      if (i == 0 || i == series.length - 1) {
        // top and tail
        peaks.push(series[i]);
        return;
      } else if (
        series[i].y > series[i - 1].y &&
        series[i].y > series[i + 1].y
      ) {
        // local max
        peaks.push(series[i]);
        i += 2;
        return;
      } else if (
        series[i].y < series[i - 1].y &&
        series[i].y < series[i + 1].y
      ) {
        // local min
        peaks.push(series[i]);
        i += 2;
      }
    }

    return peaks;
  }
}
