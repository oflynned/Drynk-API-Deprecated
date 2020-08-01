import {
  BaseDocument,
  BaseModelType,
  Joi,
  Repository,
  Schema
} from 'mongoize-orm';

export interface PopularDrinkType extends BaseModelType {
  name: string;
  category: 'beer' | 'wine' | 'spirit' | 'cocktail';
  popularity: number;
}

export class PopularDrinkSchema extends Schema<PopularDrinkType> {
  joiBaseSchema(): object {
    return {
      name: Joi.string().required(),
      popularity: Joi.number().min(1)
    };
  }

  joiUpdateSchema(): object {
    return {};
  }
}

export class PopularDrink extends BaseDocument<
  PopularDrinkType,
  PopularDrinkSchema
> {
  joiSchema(): PopularDrinkSchema {
    return new PopularDrinkSchema();
  }

  collection(): string {
    return 'popular_drinks';
  }

  static async cacheMany(
    beers: { name: string; count: number }[]
  ): Promise<void> {
    await Promise.all(
      beers.map(beer =>
        PopularDrink.cache({
          name: beer.name,
          popularity: beer.count,
          category: 'beer'
        })
      )
    );
  }

  static async cache(props: PopularDrinkType): Promise<void> {
    await new PopularDrink().build(props).save();
  }

  static async clearCache(): Promise<void> {
    await Repository.with(PopularDrink).hardDeleteMany({});
  }
}
