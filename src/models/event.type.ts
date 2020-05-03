import { Drink } from './drink.model';
import { Puke } from './puke.model';

export type Event = Drink | Puke;

export const sortEvents = (a: Event, b: Event) => {
  const firstTime = a.toJson().createdAt.getTime();
  const secondTime = b.toJson().createdAt.getTime();
  if (firstTime < secondTime) {
    return 1;
  }

  if (firstTime > secondTime) {
    return -1;
  }

  return 0;
};
