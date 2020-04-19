import { BaseDocument, BaseModelType, Joi, Schema } from 'mongoize-orm';
import { elapsedTimeFromMsToHours, Mass, MeasureType, Time, Volume } from '../common/helpers';
import { User } from './user.model';

export interface DrinkType extends BaseModelType {
  drinkWasDowned: boolean;
  volume: number;
  abv: number;
  drinkName: string;
}

export class DrinkSchema extends Schema<DrinkType> {
  joiBaseSchema(): object {
    return {
      drinkWasDowned: Joi.bool().required(),
      volume: Joi.number().required(),
      abv: Joi.number()
        .required()
        .min(0)
        .max(100),
      drinkName: Joi.string().required()
    };
  }

  joiUpdateSchema(): object {
    return undefined;
  }
}

export class Drink extends BaseDocument<DrinkType, DrinkSchema> {
  private readonly ETHANOL_DENSITY_GRAMS_PER_ML = 0.789; // 0.789 g/ml
  private readonly STANDARD_DRINK_ETHANOL_GRAMS = 10; // 10 g

  // assume a drink was drunk over 15-30 mins in equal amounts consistently
  // otherwise the drink was downed and will be accumulated as one hit when it is digested
  // if necessary an end time can be added later on a migration
  // its start time corresponds to .createdAt
  // if a drink is added to the session after this, then the first drink must be finished at that point

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
    const grams = this.ethanolVolume('ML').value * this.ETHANOL_DENSITY_GRAMS_PER_ML;

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
    return this.ethanolMass('G').value / this.STANDARD_DRINK_ETHANOL_GRAMS;
  }

  timeToPeakEffect(user: User, time: Time): MeasureType<Time> {
    const createdMsAgo = Date.now() - this.toJson().createdAt.getTime();
    const peakEffectInMs =
      user.absorptionHalflife('MS').value - createdMsAgo;
    if (time === 'HOURS') {
      return {
        value: elapsedTimeFromMsToHours(peakEffectInMs),
        unit: 'HOURS'
      };
    }

    return {
      value: peakEffectInMs,
      unit: 'MS'
    };
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
