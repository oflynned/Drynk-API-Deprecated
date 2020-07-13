import { Container } from '../../../../infrastructure/dependency-injector';
import { AbstractBeerSeed } from '../abstract-beer.seed';

const beers = require('./beers.json');

export class OpenBeerDatabaseSeed extends AbstractBeerSeed {
  async run(di: Container): Promise<void> {
    const validBeers = beers
      .filter((beer: any) => beer.fields.abv && beer.fields.name && beer.fields.abv > 0)
      .map(
        (beer: any) => {
          return {
            name: beer.fields.name,
            abv: parseInt(String(beer.fields.abv * 100)) / 100,
            style: beer.fields.style_name,
            type: 'beer'
          };
        }
      );

    await super.persist(validBeers, di.alcoholRepository, di.entityManager);
  }
}
