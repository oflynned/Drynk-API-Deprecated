type DatasetBeer = {
  fields: Beer;
};

type Beer = {
  abv: number;
  name: string;
};

const analyseBeers = async () => {
  const beers: DatasetBeer[] = require('./dataset/beers.json');
  const validBeers = beers
    .filter(
      (beer: DatasetBeer) =>
        beer.fields.abv && beer.fields.name && beer.fields.abv > 0
    )
    .map(
      (beer: DatasetBeer): Beer => {
        return {
          ...beer.fields,
          abv: parseInt(String(beer.fields.abv * 100)) / 100
        };
      }
    );
};

(async () => analyseBeers())();
