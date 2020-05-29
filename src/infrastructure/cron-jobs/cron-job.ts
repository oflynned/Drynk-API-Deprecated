export abstract class CronJob {
  abstract cronFrequency(): string;

  abstract async runJob(): Promise<void>;
}
