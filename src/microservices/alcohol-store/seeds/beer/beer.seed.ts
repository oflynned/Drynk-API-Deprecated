import { Item, ItemType } from './item.model';

type BeerType = {
  fields: ItemType;
};

export const seedBeers = async () => {
  const beers: BeerType[] = require('./beers.json');
  const validBeers = beers
    .filter(
      (beer: BeerType) =>
        beer.fields.abv && beer.fields.name && beer.fields.abv > 0
    )
    .map(
      (beer: BeerType): ItemType => {
        return {
          name: beer.fields.name,
          abv: parseInt(String(beer.fields.abv * 100)) / 100,
          type: 'beer'
        };
      }
    );

  await Promise.all(
    validBeers.map(async (beer: ItemType, index: number) => {
      console.log(`Seeding ${index + 1}/${validBeers.length}`);
      await new Item().build(beer).save();
    })
  );
};
