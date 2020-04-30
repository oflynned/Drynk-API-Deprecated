import { BaseDocument, BaseModelType, Joi, Schema } from 'mongoize-orm';
import {
  elapsedTimeFromMsToHours,
  Mass,
  MeasureType,
  Time,
  Volume
} from '../common/helpers';

export interface DrinkType extends BaseModelType {
  // sessionId: string;
  // userId: string;
  volume: number;
  abv: number;
  drinkName: string;
}

export class DrinkSchema extends Schema<DrinkType> {
  joiBaseSchema(): object {
    return {
      // sessionId: Joi.string().required(),
      // userId: Joi.string().required(),
      volume: Joi.number()
        .min(1)
        .required(),
      abv: Joi.number()
        .min(1)
        .max(100)
        .required(),
      drinkName: Joi.string().required()
    };
  }

  joiUpdateSchema(): object {
    return undefined;
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

    if (unit === 'ML') {
      return {
        unit: 'ML',
        value: mls
      };
    }

    return {
      unit: 'L',
      value: mls * 1000
    };
  }

  ethanolMass(unit: Mass): MeasureType<Mass> {
    const grams =
      this.ethanolVolume('ML').value * this.ETHANOL_DENSITY_GRAMS_PER_ML;

    if (unit === 'KG') {
      return {
        value: grams * 1000,
        unit: 'KG'
      };
    }

    return {
      value: grams,
      unit: 'G'
    };
  }

  standardDrinks(): number {
    return this.ethanolMass('G').value / Drink.STANDARD_DRINK_ETHANOL_GRAMS;
  }

  timeSinceDrink(time: Time): MeasureType<Time> {
    const timeSinceDrink = Date.now() - this.toJson().createdAt.getTime();

    if (time === 'HOURS') {
      return {
        value: elapsedTimeFromMsToHours(timeSinceDrink),
        unit: 'HOURS'
      };
    }

    return {
      value: timeSinceDrink,
      unit: 'MS'
    };
  }
}
