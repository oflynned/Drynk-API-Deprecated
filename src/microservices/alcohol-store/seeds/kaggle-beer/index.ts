import { Container } from '../../../../infrastructure/dependency-injector';
import { AbstractBeerSeed } from '../abstract-beer.seed';

const beers = require('./beers.json');

export class KaggleDatabaseSeed extends AbstractBeerSeed {
  async run(di: Container): Promise<void> {
    const validBeers = beers
      .filter((beer: any) => beer.abv && beer.name && beer.abv > 0)
      .map(
        (beer: any) => {
          return {
            name: beer.name,
            abv: parseInt(String(beer.abv * 10000)) / 100,
            style: beer.style,
            type: 'beer'
          };
        }
      );

    await super.persist(validBeers, di.alcoholRepository, di.entityManager);
  }
}
