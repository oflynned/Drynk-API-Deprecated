import { Drink, DrinkType } from '../models/drink.model';
import { Repository } from 'mongoize-orm';

export const createDrink = async (params: DrinkType): Promise<object> => {
  const drink: Drink = await new Drink().build(params).save();
  return drink.toJson();
};

export const findAllDrinks = async (): Promise<object[]> => {
  const drinks = await Repository.with(Drink).findAll();
  return drinks.map((drink: Drink) => drink.toJson());
};
