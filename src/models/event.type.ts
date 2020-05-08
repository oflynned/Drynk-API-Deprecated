import { Drink } from './drink.model';
import { Puke } from './puke.model';
import { BaseDocument } from 'mongoize-orm/dist/document/base-document';

export type Event = Drink | Puke;

export const sortTimeDescending = (
  a: BaseDocument<any, any>,
  b: BaseDocument<any, any>
) => {
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

export const sortTimeAscending = (
  a: BaseDocument<any, any>,
  b: BaseDocument<any, any>
) => {
  const firstTime = a.toJson().createdAt.getTime();
  const secondTime = b.toJson().createdAt.getTime();
  if (firstTime > secondTime) {
    return 1;
  }

  if (firstTime < secondTime) {
    return -1;
  }

  return 0;
};
