import { BaseDocument, BaseModelType, Joi, Schema } from 'mongoize-orm';
import { elapsedTimeFromMsToHours, toDecimalPlaces } from '../common/helpers';

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

export type Granularity = 'HOURS' | 'MS';

export interface TimeGranularity {
  elapsedTime: number,
  granularity: Granularity
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
    return toDecimalPlaces(this.ethanolGrams() / this.STANDARD_DRINK_ETHANOL_GRAMS);
  }

  timeSinceDrink(granularity: Granularity): TimeGranularity {
    const timeSinceDrink = Date.now() - this.toJson().createdAt.getTime();

    if (granularity === 'HOURS') {
      return {
        elapsedTime: elapsedTimeFromMsToHours(timeSinceDrink),
        granularity: 'HOURS'
      };
    }

    return {
      elapsedTime: timeSinceDrink,
      granularity: 'MS'
    };
  }
}
