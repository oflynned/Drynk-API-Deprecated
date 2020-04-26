import {
  clamp,
  Length,
  Mass,
  MealSize,
  MeasureType,
  ONE_HOUR_IN_MS,
  Sex,
  Time
} from '../common/helpers';
import { Drink } from './drink.model';

export class User {
  private readonly ABSORPTION_HALFLIFE_EMPTY_STOMACH = 30; // mins
  private readonly ABSORPTION_HALFLIFE_NORMAL_MEAL = 45; // mins
  private readonly ABSORPTION_HALFLIFE_LARGE_MEAL = 60; // mins

  private readonly mealSize: MealSize;
  private readonly sex: Sex;
  private readonly weightInKg: number;
  private readonly heightInCm: number;

  constructor(user:User) {
    this.sex = 'MALE';
    this.mealSize = 'NONE';
    this.weightInKg = 92;
    this.heightInCm = 189;
  }

  get isMale(): boolean {
    return this.sex === 'MALE';
  }

  get widmarkConstant(): number {
    const weight = this.weight('KG').value;
    const height = this.height('CM').value;

    if (this.isMale) {
      const r = 0.3161 - 0.004821 * weight + 0.004632 * height;
      return clamp(r, 0.6, 0.87);
    }

    const r = 0.3122 - 0.006446 * weight + 0.004466 * height;
    return clamp(r, 0.44, 0.8);
  }

  get absorptionDelayCoefficient(): number {
    return (
      this.ABSORPTION_HALFLIFE_EMPTY_STOMACH /
      this.absorptionHalflife('MINS').value
    );
  }

  get excretionRate(): number {
    // approx one standard drink every hour
    return Drink.STANDARD_DRINK_ETHANOL_GRAMS / 60;
  }

  absorptionHalflife(time: Time): MeasureType<Time> {
    const halflife = () => {
      if (this.mealSize === 'LARGE') {
        return this.ABSORPTION_HALFLIFE_LARGE_MEAL;
      }

      if (this.mealSize === 'SMALL') {
        return this.ABSORPTION_HALFLIFE_NORMAL_MEAL;
      }

      return this.ABSORPTION_HALFLIFE_EMPTY_STOMACH;
    };

    if (time === 'HOURS') {
      return {
        value: halflife() / 60,
        unit: 'HOURS'
      };
    }

    if (time === 'MINS') {
      return {
        value: halflife(),
        unit: 'MINS'
      };
    }

    if (time === 'SECS') {
      return {
        value: halflife() * 60,
        unit: 'SECS'
      };
    }

    return {
      value: (halflife() / 60) * ONE_HOUR_IN_MS,
      unit: 'MS'
    };
  }

  height(unit: Length): MeasureType<Length> {
    if (unit === 'CM') {
      return {
        value: this.heightInCm,
        unit
      };
    }

    return {
      value: this.heightInCm / 100,
      unit
    };
  }

  weight(unit: Mass): MeasureType<Mass> {
    if (unit === 'G') {
      return {
        value: this.weightInKg * 1000,
        unit
      };
    }

    return {
      value: this.weightInKg,
      unit
    };
  }
}
