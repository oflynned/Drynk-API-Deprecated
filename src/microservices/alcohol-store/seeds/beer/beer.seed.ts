import { ItemType } from './item.model';
import { Container } from '../../../../infrastructure/dependency-injector';
import { Alcohol } from '../../entities/alcohol.entity';

type BeerType = {
  fields: ItemType;
};

export const seedBeers = async (di: Container) => {
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

  await di.alcoholRepository.nativeDelete({});

  validBeers.map(({ abv, name, type }: ItemType) => {
    const alcohol = new Alcohol(abv, name, type);
    di.entityManager.persistLater(alcohol);
  });

  await di.entityManager.flush();
};
