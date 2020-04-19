import { Drink } from '../models/drink.model';
import { User } from '../models/user.model';
import { elapsedTimeFromMsToHours } from '../common/helpers';

type WidmarkOption = {
  reportBac: 'MAX' | 'FORCED' | 'ACTUAL';
  reportedTime?: number;
};

export const expectedBacFromEthanolMass = (
  ethanolGramsInBlood: number,
  user: User
): number => {
  // BAC = (D / (r * W) * 100) - (β * t)
  // BAC = (ethanol of drink in grams / (widmark factor * weight in g) * 100) - (metabolism rate * time in hours since drink)
  return (
    (ethanolGramsInBlood / (user.widmarkConstant * user.weight('G').value)) *
    100
  );
};

export const expectedBacFromSingularDrink = (
  drink: Drink,
  user: User,
  options: WidmarkOption
): number => {
  // the max bac a drink has on someone is after 0.5-1 hours
  // this peak value is always accessible by getting the user's food state at the time
  const hoursWaitTimeToPeakDrinkBac = user.absorptionHalflife('HOURS').value;
  const { reportBac, reportedTime } = options;

  let hoursElapsedSinceDrink;
  if (reportBac === 'MAX') {
    hoursElapsedSinceDrink = hoursWaitTimeToPeakDrinkBac;
  } else if (reportBac === 'FORCED') {
    if (reportedTime <= drink.toJson().createdAt.getTime()) {
      // no effect from drink if it hasn't been drunk yet
      return 0;
    }

    // otherwise it's at some point afterwards
    hoursElapsedSinceDrink = elapsedTimeFromMsToHours(
      reportedTime - drink.toJson().createdAt.getTime()
    );
  } else {
    hoursElapsedSinceDrink = drink.timeSinceDrink('HOURS').value;
  }

  // BAC = (D / (r * W) * 100) - (β * t)
  // BAC = (ethanol of drink in grams / (widmark factor * weight in g) * 100) - (metabolism rate * time in hours since drink)
  const maxBacEffect =
    (drink.ethanolMass('G').value /
      (user.widmarkConstant * user.weight('G').value)) *
    100;

  // if the time since the drink was added is less than the time it takes to enter the system
  // then the bac will increase over a time period until it reaches its peak
  if (hoursElapsedSinceDrink < hoursWaitTimeToPeakDrinkBac) {
    // so then until the full ramp-up period has passed, then the current bac is just a percentage of this
    return (
      maxBacEffect * (hoursElapsedSinceDrink / hoursWaitTimeToPeakDrinkBac)
    );
  }

  // after the wait to peak, excretion starts and the max bac observed from the drink starts to decay
  const bloodAlcoholBacEffectFromDrink =
    maxBacEffect -
    user.excretionRate *
      (hoursElapsedSinceDrink - hoursWaitTimeToPeakDrinkBac);

  // negative bac values should be clamped at 0
  return Math.max(0, bloodAlcoholBacEffectFromDrink);
};
