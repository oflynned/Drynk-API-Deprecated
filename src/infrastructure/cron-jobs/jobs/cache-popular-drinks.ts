import { CronJob } from '../cron-job';
import { DrinkService } from '../../../services/drink.service';
import { PopularDrink } from '../../../models/popular-drink';

export class CachePopularDrinksJob extends CronJob {
  private drinkService: DrinkService;

  constructor() {
    super();
    this.drinkService = new DrinkService();
  }

  async runJob(): Promise<void> {
    await PopularDrink.clearCache();
    const popularBeers = await this.drinkService.aggregatePopularBeers();
    await PopularDrink.cacheMany(popularBeers);
  }

  cronFrequency(): string {
    // every hour
    return '0 0 * * * *';
  }
}
