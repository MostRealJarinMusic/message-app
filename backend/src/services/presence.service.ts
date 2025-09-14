import {
  PresenceStatus,
  PresenceUpdate,
  WSEventType,
} from "../../../common/types";
import { UserRepo } from "../db/repos/user.repo";
import { EventBusPort } from "../types/types";

export class PresenceService {
  private presenceStore = new Map<string, PresenceStatus>();

  constructor(
    private readonly userRepo: UserRepo,
    private readonly eventBus: EventBusPort
  ) {}

  //Temporary
  async getAllUserPresences() {
    const users = await this.userRepo.getAllUsers();
    const userIds = users.map((u) => u.id);
    const presences = this.getSnapshot(userIds);

    return presences;
  }

  updateStatus(update: PresenceUpdate) {
    const previous = this.presenceStore.get(update.userId);
    if (previous === update.status) return;

    this.presenceStore.set(update.userId, update.status);

    this.eventBus.publish(WSEventType.PRESENCE, update);
  }

  getSnapshot(userIds: string[]): PresenceUpdate[] {
    return userIds.map((userId) => ({
      userId,
      status: this.presenceStore.get(userId) || PresenceStatus.OFFLINE,
    }));
  }
}
