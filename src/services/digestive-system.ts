import { Drink } from '../models/drink.model';
import { expectedBacFromEthanolMass } from './widmark.service';
import { User } from '../models/user.model';

type StomachContents = {
  volumeMls: number,
  ethanolGrams: number
}

export class DigestiveSystem {
  private readonly _user: User;

  private _stomachContents: StomachContents = {
    volumeMls: 0,
    ethanolGrams: 0
  };

  private _intaken = 0;   // concentration of g of ethanol relative to the volume of the liquid in stomach
  private _absorbed = 0;  // g of ethanol in blood
  private _excreted = 0;  // g of ethanol pissed out

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

  // this is correct as it's zero-order eq
  // should the liquid amount be accounted for in some way for the actual liquid volume in the stomach?
  // beer vs vodka have different concentrations and combinations in the stomach
  private addToStomach(drink: Drink): void {
    this._intaken += drink.ethanolMass('G').value;
  }

  // TODO incorrect, absorption is a first-order eq
  private absorbToBlood(): void {
    if (this._intaken > 0) {
      const rate =
        this._intaken < this._user.absorptionRate
          ? this._intaken
          : this._user.absorptionRate;
      this._intaken -= rate;
      this._absorbed += rate;
    }
  }

  // the rate needs to be pegged, but this is correct as a static zero-order eq
  private excreteFromBlood(): void {
    if (this._absorbed > 0) {
      const rate =
        this._absorbed < this._user.excretionRate
          ? this._absorbed
          : this._user.excretionRate;
      this._absorbed -= rate;
      this._excreted += rate;
    }
  }
}
