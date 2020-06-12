import { CronJob } from '../cron-job';
import { User } from '../../../models/user.model';
import { FirebaseHelper } from '../../../common/firebase';

export class CleanInactiveUnonboardedUsersJob extends CronJob {
  async runJob(): Promise<void> {
    const inactiveUsers: User[] = await User.findInactive();
    if (inactiveUsers.length === 0) {
      return;
    }

    await Promise.all(
      inactiveUsers.map(async (user: User) => {
        await FirebaseHelper.purgeFirebaseAccount(user.toJson().providerId);
        await user.hardDelete();
      })
    );
  }

  cronFrequency(): string {
    // 8am everyday
    return '0 0 8 * * *';
  }
}
