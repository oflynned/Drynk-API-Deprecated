import { expectedBacFromEthanolMass } from './widmark';
import { Drink } from '../../models/drink.model';
import { Event } from '../../models/event.type';
import { Drunkard } from '../../models/drunkard.model';

type StomachContents = {
  volumeLitres: number;
  ethanolGrams: number;
};

export class DigestiveSystem {
  private readonly drunkard: Drunkard;
  private _intaken: StomachContents = {
    volumeLitres: 0,
    ethanolGrams: 0
  };
  private _absorbed = 0; // g of ethanol in blood
  private _excreted = 0; // g of ethanol pissed out

  constructor(drunkard: Drunkard) {
    this.drunkard = drunkard;
  }

  get bloodAlcoholContent(): number {
    if (this._absorbed === 0) {
      return 0;
    }

    // TODO ~10% difference due to absorption, this should be changed via the first order absorption method
    return expectedBacFromEthanolMass(this._absorbed * 1.1, this.drunkard);
  }

  puke(): void {
    this._intaken = {
      volumeLitres: this._intaken.volumeLitres * 0.1,
      ethanolGrams: this._intaken.ethanolGrams * 0.1
    };
  }

  process(events?: Event[]): void {
    events.map((event: Event) => {
      switch (event.constructor.name) {
        case 'Drink':
          this.addToStomach(event as Drink);
          break;
        case 'Puke':
          this.puke();
          break;
        default:
          break;
      }
    });

    this.absorbToBlood();
    this.excreteFromBlood();
  }

  private addToStomach(drink: Drink): void {
    this._intaken.volumeLitres += drink.toJson().volume / 1000;
    this._intaken.ethanolGrams += drink.ethanolMass().value;
  }

  // TODO incorrect, absorption is a first-order eq, a rate of n grams per litre is cleared per hour
  //      having a drink adds more volume and can change the potency of the ethanol quantity in the stomach
  private absorbToBlood(): void {
    if (this._intaken.ethanolGrams > 0) {
      // TODO volume needs to be taken into account so that puking & drinking water have more context
      // const stomachContentsDistribution = this._intaken.ethanolGrams / this._intaken.volumeLitres;
      // const processableEthanol = stomachContentsDistribution * 0.1; // 1L per minute?
      //
      // const ethanolWeightProcessed = this._intaken.ethanolGrams < processableEthanol ? this._intaken.ethanolGrams : processableEthanol;
      // const stomachVolumeProcessed = this._intaken.volumeLitres < 0.1 ? this._intaken.volumeLitres : 0.1;
      //
      // this._intaken.ethanolGrams -= ethanolWeightProcessed;
      // this._intaken.volumeLitres -= stomachVolumeProcessed;

      // TODO wrong? this is the coefficient and not 1g per minute absorption
      const rate =
        this._intaken.ethanolGrams < this.drunkard.absorptionDelayCoefficient
          ? this._intaken.ethanolGrams
          : this.drunkard.absorptionDelayCoefficient;
      this._intaken.ethanolGrams -= rate;
      this._absorbed += rate;
    }
  }

  private excreteFromBlood(): void {
    if (this._absorbed > 0) {
      const rate =
        this._absorbed < this.drunkard.excretionRate
          ? this._absorbed
          : this.drunkard.excretionRate;
      this._absorbed -= rate;
      this._excreted += rate;
    }
  }
}
