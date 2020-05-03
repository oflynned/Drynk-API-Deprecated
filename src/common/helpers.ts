export const ONE_HOUR_IN_MS = 3.6e6;
export const ONE_MINUTE_IN_MS = ONE_HOUR_IN_MS / 60;
export const ONE_DAY_IN_MS = 24 * ONE_HOUR_IN_MS;

export interface Point<X, Y> {
  x: X;
  y: Y;
}

export interface MeasureType<Unit> {
  value: number;
  unit: Unit;
}

// TODO add british imperial
export type UnitPreference = 'metric' | 'imperial';

export type Sex = 'male' | 'female';

export type Mass = 'kg' | 'g';

export type Volume = 'l' | 'ml';

export type Length = 'm' | 'cm';

export type MealSize = 'none' | 'small' | 'large';

export type Time = 'hours' | 'mins' | 'secs' | 'ms';

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

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};
