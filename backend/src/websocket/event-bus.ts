import {
  PresenceStatus,
  PresenceUpdate,
  WSEvent,
  WSEventPayload,
  WSEventType,
} from "@common/types";
import { EventBusPort, Handler } from "../types/types";

export class EventBus implements EventBusPort {
  private handlers: { [K in WSEventType]?: Handler<K>[] } = {};
  //private presenceStore = new Map<string, PresenceStatus>();

  publish<T extends WSEventType>(event: T, payload: WSEventPayload[T]) {
    const eventHandlers = this.handlers[event];
    if (eventHandlers) {
      eventHandlers.forEach((handler) => handler(payload));
    }
  }

  subscribe<T extends WSEventType>(event: T, handler: Handler<T>) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  // getPresenceSnapshot(userIds: string[]): PresenceUpdate[] {
  //   return userIds.map((id) => ({
  //     userId: id,
  //     status: this.presenceStore.get(id) || ("offline" as PresenceStatus),
  //   }));
  // }
}
