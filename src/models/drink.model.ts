import {
  BaseDocument,
  BaseModelType,
  Joi,
  Repository,
  Schema
} from 'mongoize-orm';
import {
  elapsedTimeFromMsToHours,
  Mass,
  MeasureType,
  Time,
  Volume
} from '../common/helpers';
import { InternalModelType } from 'mongoize-orm/dist/document/base-document/schema';

export interface DrinkType extends BaseModelType {
  volume: number;
  abv: number;
  drinkName: string;
  drinkType: 'wine' | 'beer' | 'spirit' | 'cocktail';
  sessionId: string;
}

export class DrinkSchema extends Schema<DrinkType> {
  joiBaseSchema(): object {
    return {
      volume: Joi.number()
        .min(1)
        .max(10000)
        .required(),
      abv: Joi.number()
        .min(0)
        .max(100)
        .required(),
      drinkName: Joi.string().required(),
      drinkType: Joi.string()
        .valid('beer', 'wine', 'spirit', 'cocktail')
        .required(),
      sessionId: Joi.string()
        .uuid()
        .required()
    };
  }

  joiUpdateSchema(): object {
    return {
      volume: Joi.number().min(1),
      abv: Joi.number()
        .min(0)
        .max(100),
      drinkName: Joi.string(),
      drinkType: Joi.string().valid('beer', 'wine', 'spirit', 'cocktail')
    };
  }
}

export class Drink extends BaseDocument<DrinkType, DrinkSchema> {
  public static readonly STANDARD_DRINK_ETHANOL_GRAMS = 10; // 10 g

  private readonly ETHANOL_DENSITY_GRAMS_PER_ML = 0.789; // 0.789 g/ml

  static findMany(query = {}): Promise<Drink[]> {
    return Repository.with(Drink).findMany(query);
  }

  static findBySessionIds(
    ids: string[],
    sinceStartTime?: Date
  ): Promise<Drink[]> {
    const startTime = sinceStartTime
      ? { createdAt: { $gt: sinceStartTime } }
      : {};

    return Repository.with(Drink).findMany({
      sessionId: { $in: ids },
      ...startTime
    });
  }

  joiSchema(): DrinkSchema {
    return new DrinkSchema();
  }

  ethanolVolume(unit: Volume): MeasureType<Volume> {
    const mls = (this.record.abv / 100) * this.record.volume;

    if (unit === 'ml') {
      return {
        unit: 'ml',
        value: mls
      };
    }

    if (unit === 'cl') {
      return {
        unit: 'cl',
        value: mls / 10
      };
    }

    return {
      unit: 'l',
      value: mls * 1000
    };
  }

  units(): number {
    return (this.record.volume * this.record.abv) / 1000;
  }

  calories(): number {
    // 7 kcal per 1g of ethanol
    return parseInt(String(this.ethanolMass().value * 7));
  }

  toJson(): DrinkType & InternalModelType & any {
    return {
      ...this.record,
      units: this.units(),
      calories: this.calories(),
      standardDrinks: this.standardDrinks(),
      ethanolMass: this.ethanolMass().value
    };
  }

  ethanolMass(): MeasureType<Mass> {
    const grams =
      this.ethanolVolume('ml').value * this.ETHANOL_DENSITY_GRAMS_PER_ML;
    return {
      value: grams,
      unit: 'g'
    };
  }

  standardDrinks(): number {
    return this.ethanolMass().value / Drink.STANDARD_DRINK_ETHANOL_GRAMS;
  }

  timeSinceDrink(time: Time): MeasureType<Time> {
    const timeSinceDrink = Date.now() - this.record.createdAt.getTime();

    if (time === 'hours') {
      return {
        value: elapsedTimeFromMsToHours(timeSinceDrink),
        unit: 'hours'
      };
    }

    return {
      value: timeSinceDrink,
      unit: 'ms'
    };
  }
}
