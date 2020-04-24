import { Drink, DrinkType } from '../models/drink.model';
import { Repository } from 'mongoize-orm';

export const createDrink = async (params: DrinkType): Promise<object> => {
  const drink: Drink = await new Drink().build(params).save();
  return drink.toJson();
};

export const findAllDrinks = async (): Promise<object[]> => {
  const drinks: Drink[] = await Repository.with(Drink).findAll();
  drinks.sort((a: Drink, b: Drink) => {
    if (a.toJson().createdAt.getTime() < b.toJson().createdAt.getTime()) {
      return 1;
    }
    if (a.toJson().createdAt.getTime() > b.toJson().createdAt.getTime()) {
      return -1;
    }

    return 0;
  });

  return drinks.map((drink: Drink) => drink.toJson());
};
