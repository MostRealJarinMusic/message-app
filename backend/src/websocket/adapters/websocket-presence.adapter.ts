import { PresenceUpdate, WSEventType } from "../../../../common/types";
import { PresencePort } from "../../types/types";
import { EventBus } from "../event-bus";

export class PresenceAdapter implements PresencePort {
  constructor(private readonly eventBus: EventBus) {}

  async getSnapshot(userIds: string[]): Promise<PresenceUpdate[]> {
    return this.eventBus.getPresenceSnapshot(userIds);
  }

  updateStatus(presenceUpdate: PresenceUpdate): void {
    this.eventBus.publish(WSEventType.PRESENCE, presenceUpdate);
  }
}
