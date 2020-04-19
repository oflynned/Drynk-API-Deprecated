import { Drink } from '../models/drink.model';
import { expectedBacFromEthanolMass } from './widmark.service';
import { User } from '../models/user.model';

export class DigestiveSystem {
  private readonly _user: User;
  private readonly ABSORBANCE_RATE = 0.8 * (100 / 60);

  private _intaken = 0;
  private _absorbed = 0;
  private _excreted = 0;

  constructor(user: User) {
    this._user = user;
  }

  get bloodAlcoholContent(): number {
    if (this._absorbed === 0) {
      return 0;
    }

    return expectedBacFromEthanolMass(this._absorbed, this._user);
  }

  puke(): void {
    this._intaken *= 0.1; // lol
  }

  digest(drinks?: Drink[]): void {
    if (drinks?.length > 0) {
      drinks.map((drink: Drink) => this.addToStomach(drink));
    }

    this.absorbToBlood();
    this.excreteFromBlood();
  }

  activeEthanolInSystem(): number {
    return this._absorbed;
  }

  private addToStomach(drink: Drink): void {
    this._intaken += drink.ethanolMass('G').value;
  }

  private absorbToBlood(): void {
    if (this._intaken > 0) {
      const transient =
        this._intaken < this.ABSORBANCE_RATE
          ? this._intaken
          : this.ABSORBANCE_RATE;
      this._intaken -= transient;
      this._absorbed += transient;
    }
  }

  private excreteFromBlood(): void {
    if (this._absorbed > 0) {
      const transient =
        this._absorbed < this._user.metabolismRate
          ? this._absorbed
          : this._user.metabolismRate;
      this._absorbed -= transient;
      this._excreted += transient;
    }
  }
}
