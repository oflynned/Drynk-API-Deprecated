import { User } from '../../models/user.model';

export const expectedBacFromEthanolMass = (
  activeEthanolGrams: number,
  user: User
): number => {
  // BAC = (D / (r * W) * 100) - (β * t)
  // BAC = (ethanol of drink in grams / (widmark factor * weight in g) * 100) - (metabolism rate * time in hours since drink)
  return (
    (activeEthanolGrams / (user.widmarkConstant * user.weight('G').value)) * 100
  );
};
