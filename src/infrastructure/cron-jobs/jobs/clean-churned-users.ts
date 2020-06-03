import { CronJob } from '../cron-job';
import { User } from '../../../models/user.model';
import { auth } from 'firebase-admin';

export class CleanInactiveUnonboardedUsersJob extends CronJob {
  async runJob(): Promise<void> {
    const inactiveUsers: User[] = await User.findInactive();
    if (inactiveUsers.length === 0) {
      return;
    }

    await Promise.all(
      inactiveUsers.map(async (user: User) => {
        await auth().deleteUser(user.toJson().providerId);
        await user.hardDelete();
      })
    );
  }

  cronFrequency(): string {
    return '0 0 8 * * *';
  }
}
