import { WSEventPayload, WSEventType } from "@common/types";
import { EventBusPort, Handler } from "../types/types";

export class EventBus implements EventBusPort {
  private handlers: { [K in WSEventType]?: Handler<K>[] } = {};

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
}
