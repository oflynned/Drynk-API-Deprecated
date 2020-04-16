export const ONE_HOUR_IN_MS = 3.6e+6;

export const toDecimalPlaces = (n: number, places = 3): number => {
  return parseFloat((n).toFixed(places));
};

export const elapsedTimeFromMsToHours = (elapsedTime: number): number => {
  return toDecimalPlaces(elapsedTime / ONE_HOUR_IN_MS);
};

export const elapsedHoursToMs = (elapsedTime: number): number => {
  return elapsedTime * ONE_HOUR_IN_MS;
};
