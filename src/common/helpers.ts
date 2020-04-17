export const ONE_HOUR_IN_MS = 3.6e6;

export interface MeasureType<Unit> {
  value: number;
  unit: Unit;
}

export type Sex = 'MALE' | 'FEMALE';

export type Mass = 'KG' | 'G';

export type Length = 'M' | 'CM';

export type MealSize = 'NONE' | 'SMALL' | 'LARGE';

export type Time = 'HOURS' | 'MS';

export const toDecimalPlaces = (n: number, places = 3): number => {
  return parseFloat(n.toFixed(places));
};

export const elapsedTimeFromMsToHours = (elapsedTime: number): number => {
  return toDecimalPlaces(elapsedTime / ONE_HOUR_IN_MS);
};

export const elapsedHoursToMs = (elapsedTime: number): number => {
  return elapsedTime * ONE_HOUR_IN_MS;
};

export const sum = (series: number[]): number => {
  return series.reduce((a: number, b: number) => a + b, 0);
};
