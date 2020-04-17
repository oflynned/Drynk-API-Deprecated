import {
  Length,
  Mass,
  MealSize,
  MeasureType,
  ONE_HOUR_IN_MS,
  Sex,
  Time
} from '../common/helpers';

export class User {
  private readonly MALE_WIDMARK_CONSTANT = 0.68;    // avg male constant
  private readonly FEMALE_WIDMARK_CONSTANT = 0.55;  // avg female constant

  private readonly MALE_METABOLISM_RATE = 0.017;    // avg male liver metabolism
  private readonly FEMALE_METABOLISM_RATE = 0.015;  // avg female liver metabolism

  private readonly PEAK_BAC_EMPTY_STOMACH = 0.5;    // 30 mins
  private readonly PEAK_BAC_NORMAL_STOMACH = 0.75;  // 45 mins
  private readonly PEAK_BAC_FULL_STOMACH = 1;       // 1 hour

  private readonly mealSize: MealSize;
  private readonly sex: Sex;
  private readonly weightInKg: number;
  private readonly heightInCm: number;

  constructor() {
    this.sex = 'MALE';
    this.mealSize = 'SMALL';
    this.weightInKg = 92;
    this.heightInCm = 189;
  }

  get isMale(): boolean {
    return this.sex === 'MALE';
  }

  get widmarkConstant(): number {
    // const weight = this.weight('KG').value;
    // const height = this.height('CM').value;

    if (this.isMale) {
      return this.MALE_WIDMARK_CONSTANT;
      // return (0.3161 - 0.004821 * weight + 0.004632 * height);
    }

    return this.FEMALE_WIDMARK_CONSTANT;
    // return (0.3122 - 0.006446 * weight + 0.004466 * height);
  }

  get metabolismRate(): number {
    return this.isMale
      ? this.MALE_METABOLISM_RATE
      : this.FEMALE_METABOLISM_RATE;
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

  timeToPeakDrinkEffect(time: Time): MeasureType<Time> {
    const peakTime = () => {
      if (this.mealSize === 'LARGE') {
        return this.PEAK_BAC_FULL_STOMACH;
      }

      if (this.mealSize === 'SMALL') {
        return this.PEAK_BAC_NORMAL_STOMACH;
      }

      return this.PEAK_BAC_EMPTY_STOMACH;
    };

    if (time === 'HOURS') {
      return {
        value: peakTime(),
        unit: 'HOURS'
      };
    }

    return {
      value: peakTime() * ONE_HOUR_IN_MS,
      unit: 'MS'
    };
  }
}
