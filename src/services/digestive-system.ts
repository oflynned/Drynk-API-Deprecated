import { Drink } from '../models/drink.model';
import { expectedBacFromEthanolMass } from './widmark.service';
import { User } from '../models/user.model';

type StomachContents = {
  volumeLitres: number,
  ethanolGrams: number
}

export class DigestiveSystem {
  private readonly _user: User;

  private readonly STOMACH_VOLUME = 44; // litres
  private readonly ABSORPTION_RATE = 6; // elimination rate per hour

  private _intaken: StomachContents = {
    volumeLitres: 0,
    ethanolGrams: 0
  };

  // private _intaken = 0;   // concentration of g of ethanol relative to the volume of the liquid in stomach
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
    this._intaken = {
      volumeLitres: this._intaken.volumeLitres * 0.1,
      ethanolGrams: this._intaken.ethanolGrams * 0.1
    };
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
  // I drink a beer and it can be instantaneous or in additions of x mls every y mins
  private addToStomach(drink: Drink): void {
    this._intaken.volumeLitres += drink.toJson().volume / 1000;
    this._intaken.ethanolGrams += drink.ethanolMass('G').value;
  }

  // TODO incorrect, absorption is a first-order eq
  // a rate of n grams per litre is cleared per hour
  // having a drink adds more volume and can change the potency of the ethanol
  private absorbToBlood(): void {
    if (this._intaken.ethanolGrams > 0) {
      // const stomachContentsDistribution = this._intaken.ethanolGrams / this._intaken.volumeLitres;
      // const processableEthanol = stomachContentsDistribution * 0.1; // 1L per minute?
      //
      // const ethanolWeightProcessed = this._intaken.ethanolGrams < processableEthanol ? this._intaken.ethanolGrams : processableEthanol;
      // const stomachVolumeProcessed = this._intaken.volumeLitres < 0.1 ? this._intaken.volumeLitres : 0.1;
      //
      // this._intaken.ethanolGrams -= ethanolWeightProcessed;
      // this._intaken.volumeLitres -= stomachVolumeProcessed;

      const rate = this._intaken.ethanolGrams < this._user.absorptionDelayCoefficient
        ? this._intaken.ethanolGrams
        : this._user.absorptionDelayCoefficient;
      this._intaken.ethanolGrams -= rate;
      this._absorbed += rate;
    }
  }

  // this is correct as a static zero-order eq
  // could be a delay before the excretion process begins?
  // right now it's instantaneous which is incorrect?
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
