import { FriendService } from "./friend-service";
import { ServerService } from "./server-service";

export class RelevanceService {
  static async getRelevantUserIds(userId: string) {
    const friendIds = await FriendService.getFriendIds(userId);
    const sharedServerUserIds = await ServerService.getSharedServerUserIds(
      userId
    );

    return Array.from(new Set([...friendIds, ...sharedServerUserIds]));
  }
}
