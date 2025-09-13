import { FriendService } from "./friend.service";
import { ServerService } from "./server.service";

export class RelevanceService {
  constructor(
    private readonly friendService: FriendService,
    private readonly serverService: ServerService
  ) {}

  async getRelevantUserIds(userId: string) {
    const friendIds = await this.friendService.getFriendIds(userId);
    const sharedServerUserIds = await this.serverService.getSharedServerUserIds(
      userId
    );

    return Array.from(new Set([...friendIds, ...sharedServerUserIds]));
  }
}
