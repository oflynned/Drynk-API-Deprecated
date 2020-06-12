import { Drunkard } from '../../models/drunkard.model';

export const expectedBacFromEthanolMass = (
  activeEthanolGrams: number,
  drunkard: Drunkard
): number => {
  // BAC = (D / (r * W) * 100) - (β * t)
  // BAC = (ethanol of drink in grams / (widmark factor * weight in g) * 100) - (metabolism rate * time in hours since drink)
  return (
    (activeEthanolGrams /
      (drunkard.widmarkConstant * drunkard.weight('g').value)) *
    100
  );
};
