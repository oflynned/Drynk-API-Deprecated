import { BaseDocument, BaseModelType, Joi, Schema } from 'mongoize-orm';
import {
  elapsedTimeFromMsToHours,
  Mass,
  MeasureType,
  Time,
  Volume
} from '../common/helpers';

export interface DrinkType extends BaseModelType {
  volume: number;
  abv: number;
  drinkName: string;
  sessionId: string;
}

export class DrinkSchema extends Schema<DrinkType> {
  joiBaseSchema(): object {
    return {
      volume: Joi.number()
        .min(1)
        .required(),
      abv: Joi.number()
        .min(0)
        .max(100)
        .required(),
      drinkName: Joi.string().required(),
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
      drinkName: Joi.string()
    };
  }
}

export class Drink extends BaseDocument<DrinkType, DrinkSchema> {
  public static readonly STANDARD_DRINK_ETHANOL_GRAMS = 10; // 10 g

  private readonly ETHANOL_DENSITY_GRAMS_PER_ML = 0.789; // 0.789 g/ml

  joiSchema(): DrinkSchema {
    return new DrinkSchema();
  }

  ethanolVolume(unit: Volume): MeasureType<Volume> {
    const mls = (this.toJson().abv / 100) * this.toJson().volume;

    if (unit === 'ml') {
      return {
        unit: 'ml',
        value: mls
      };
    }

    return {
      unit: 'l',
      value: mls * 1000
    };
  }

  ethanolMass(unit: Mass): MeasureType<Mass> {
    const grams =
      this.ethanolVolume('ml').value * this.ETHANOL_DENSITY_GRAMS_PER_ML;

    if (unit === 'kg') {
      return {
        value: grams * 1000,
        unit: 'kg'
      };
    }

    return {
      value: grams,
      unit: 'g'
    };
  }

  standardDrinks(): number {
    return this.ethanolMass('g').value / Drink.STANDARD_DRINK_ETHANOL_GRAMS;
  }

  timeSinceDrink(time: Time): MeasureType<Time> {
    const timeSinceDrink = Date.now() - this.toJson().createdAt.getTime();

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
