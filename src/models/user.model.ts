type Sex = 'MALE' | 'FEMALE';

type Mass = 'KG' | 'G';

type Length = 'M' | 'CM'

interface MeasureType<Unit> {
  value: number,
  unit: Unit
}

export class User {
  // static readonly MALE_WIDMARK_CONSTANT = 0.68;
  // static readonly FEMALE_WIDMARK_CONSTANT = 0.55;

  private readonly MALE_METABOLISM_RATE = 0.015;
  private readonly FEMALE_METABOLISM_RATE = 0.017;

  private readonly sex: Sex;
  private readonly weightInKg: number;
  private readonly heightInCm: number;

  constructor() {
    this.sex = 'MALE';
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
      return (0.3161 - 0.004821 * weight + 0.004632 * height);
    }

    return (0.3122 - 0.006446 * weight + 0.004466 * height);
  }

  get metabolismRate(): number {
    return this.isMale ? this.MALE_METABOLISM_RATE : this.FEMALE_METABOLISM_RATE;
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
    }
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
