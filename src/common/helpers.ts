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

export type UnitPreference = 'metric' | 'us_imperial' | 'uk_imperial';

export type Sex = 'male' | 'female';

export type Mass = 'kg' | 'g';

export type Volume = 'l' | 'cl' | 'ml';

export type Length = 'm' | 'cm';

export type MealSize = 'none' | 'small' | 'large';

export type Time = 'days' | 'hours' | 'mins' | 'secs' | 'ms';

export const toDecimalPlaces = (n: number, places = 3): number => {
  return parseFloat(n.toFixed(places));
};

export const dateAtTimeAgo = (
  time: MeasureType<Time>,
  timestamp: Date = new Date()
): Date => {
  switch (time.unit) {
    case 'days':
      return new Date(timestamp.getTime() - time.value * 24 * 60 * 60 * 1000);
    default:
    case 'hours':
      return new Date(timestamp.getTime() - time.value * 60 * 60 * 1000);
    case 'mins':
      return new Date(timestamp.getTime() - time.value * 60 * 1000);
    case 'secs':
      return new Date(timestamp.getTime() - time.value * 1000);
    case 'ms':
      return new Date(timestamp.getTime() - time.value);
  }
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
