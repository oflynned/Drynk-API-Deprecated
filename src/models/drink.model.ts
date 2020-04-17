import { BaseDocument, BaseModelType, Joi, Schema } from 'mongoize-orm';
import {
  elapsedTimeFromMsToHours,
  MeasureType,
  ONE_HOUR_IN_MS,
  Time,
  toDecimalPlaces
} from '../common/helpers';
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
  private readonly ETHANOL_DENSITY_GRAMS = 0.789; // 0.789 g/ml
  private readonly STANDARD_DRINK_ETHANOL_GRAMS = 10; // 10 g

  // assume a drink was drunk over 15-30 mins in equal amounts consistently
  // otherwise the drink was downed and will be accumulated as one hit when it is digested
  // if necessary an end time can be added later on a migration
  // its start time corresponds to .createdAt
  // if a drink is added to the session after this, then the first drink must be finished at that point

  joiSchema(): DrinkSchema {
    return new DrinkSchema();
  }

  ethanolVolume(): number {
    const { abv, volume } = this.toJson();
    return (abv / 100) * volume;
  }

  ethanolGrams(): number {
    return toDecimalPlaces(this.ethanolVolume() * this.ETHANOL_DENSITY_GRAMS);
  }

  standardDrinks(): number {
    return toDecimalPlaces(
      this.ethanolGrams() / this.STANDARD_DRINK_ETHANOL_GRAMS
    );
  }

  timeToPeakEffect(user: User, time: Time): MeasureType<Time> {
    const createdMsAgo = Date.now() - this.toJson().createdAt.getTime();
    const peakEffectInMs =
      user.timeToPeakDrinkEffect('MS').value - createdMsAgo;
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
