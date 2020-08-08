import { Drink } from '../../../../models/drink.model';
import { GqlContext } from '../../../middleware/identity.middleware';
import { Session } from '../../../../models/session.model';

export const drinkResolvers = {
  // FIXME can fetch another user's drink?
  getDrink: async (root: object, args: { drinkId: string }, context: GqlContext): Promise<object> => {
    const drink: Drink = await Drink.findById(args.drinkId);
    return drink.toJson();
  },

  getDrinks: async (root: object, args: object, context: GqlContext): Promise<object> => {
    const session: Session[] = await Session.findByUserId(context.user.toJson()._id);
    const drinks: Drink[] = await Drink.findBySessionIds(session.map(session => session.toJson()._id));
    return drinks.map(drink => drink.toJson());
  }
};
