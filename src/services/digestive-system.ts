import { Drink } from '../models/drink.model';

export class DigestiveSystem {
  intaken = 0;
  absorbed = 0;
  excreted = 0;

  process(drink?: Drink): void {
    if (drink) {
      this.addToStomach(drink);
    }

    this.absorbToBlood();
    this.excreteFromBlood();
  }

  activeEthanolInSystem(): number {
    return this.absorbed;
  }

  private addToStomach(drink: Drink): void {
    this.intaken += drink.ethanolMass('G').value;
  }

  private absorbToBlood(): void {
    if (this.intaken === 0) {
      return;
    }

    this.absorbed += 0.1;
  }

  private excreteFromBlood(): void {
    if (this.absorbed === 0) {
      return;
    }

    this.absorbed -= 0.05;
    this.excreted += 0.05;
  }
}
