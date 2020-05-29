import { CronJob } from '../cron-job';
import { User } from '../../../models/user.model';
import { Repository } from 'mongoize-orm';

export class CleanInactiveUnonboardedUsersJob extends CronJob {
  async runJob(): Promise<void> {
    const inactiveUsers: User[] = await User.findInactive();
    if (inactiveUsers.length === 0) {
      return;
    }

    await Repository.with(User).hardDeleteMany({
      _id: inactiveUsers.map((user: User) => user.toJson()._id)
    });
  }

  cronFrequency(): string {
    return '0 0 8 * * *';
  }
}
