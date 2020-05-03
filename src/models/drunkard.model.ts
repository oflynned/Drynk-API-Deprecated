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
import { User } from './user.model';
import { Session } from './session.model';

export class Drunkard {
  private readonly ABSORPTION_HALFLIFE_EMPTY_STOMACH = 30; // mins
  private readonly ABSORPTION_HALFLIFE_NORMAL_MEAL = 45; // mins
  private readonly ABSORPTION_HALFLIFE_LARGE_MEAL = 60; // mins

  private readonly mealSize: MealSize;
  private readonly sex: Sex;
  private readonly weightInKg: number;
  private readonly heightInCm: number;

  constructor(session: Session, user: User) {
    this.mealSize = session.toJson().mealSize;
    this.sex = user.toJson().sex;
    this.weightInKg = user.toJson().weight;
    this.heightInCm = user.toJson().height;
  }

  get isMale(): boolean {
    return this.sex === 'male';
  }

  get widmarkConstant(): number {
    const weight = this.weight('kg').value;
    const height = this.height('cm').value;

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
      this.absorptionHalflife('mins').value
    );
  }

  get excretionRate(): number {
    // approx one standard drink every hour
    return Drink.STANDARD_DRINK_ETHANOL_GRAMS / 60;
  }

  absorptionHalflife(time: Time): MeasureType<Time> {
    const halflife = () => {
      if (this.mealSize === 'large') {
        return this.ABSORPTION_HALFLIFE_LARGE_MEAL;
      }

      if (this.mealSize === 'small') {
        return this.ABSORPTION_HALFLIFE_NORMAL_MEAL;
      }

      return this.ABSORPTION_HALFLIFE_EMPTY_STOMACH;
    };

    if (time === 'hours') {
      return {
        value: halflife() / 60,
        unit: 'hours'
      };
    }

    if (time === 'mins') {
      return {
        value: halflife(),
        unit: 'mins'
      };
    }

    if (time === 'secs') {
      return {
        value: halflife() * 60,
        unit: 'secs'
      };
    }

    return {
      value: (halflife() / 60) * ONE_HOUR_IN_MS,
      unit: 'ms'
    };
  }

  height(unit: Length): MeasureType<Length> {
    if (unit === 'cm') {
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
    if (unit === 'g') {
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
