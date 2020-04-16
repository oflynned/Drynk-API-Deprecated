type Sex = 'MALE' | 'FEMALE';

export class User {
  private readonly MALE_WIDMARK_CONSTANT = 0.68;
  private readonly FEMALE_WIDMARK_CONSTANT = 0.55;

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

  get height(): number {
    return this.heightInCm;
  }

  get weight(): number {
    return this.weightInKg * 1000;
  }

  get isMale(): boolean {
    return this.sex === 'MALE';
  }

  get widmarkConstant(): number {
    // average values
    return this.isMale ? this.MALE_WIDMARK_CONSTANT : this.FEMALE_WIDMARK_CONSTANT;

    // this doesn't work from the paper, I might be converting float <-> int weird at some point with .toFixed(...)
    // if (this.isMale) {
    //   return (0.3161 - 0.004821 * this.weight) + (0.004632 * this.height);
    // }
    //
    // return (0.3122 - 0.006446 * this.weight) + (0.004466 * this.height);
  }

  get metabolismRate(): number {
    return this.isMale ? this.MALE_METABOLISM_RATE : this.FEMALE_METABOLISM_RATE;
  }

}
