import {
  AnyWSEvent,
  WSEvent,
  WSEventPayload,
  WSEventType,
} from "../../../common/types";
import { TypingService } from "../services/typing.service";
import { ConnectionRegistry } from "./connection-registry";
import { SignedSocket } from "../types/types";

export class WebSocketRouter {
  constructor(
    private typingService: TypingService,
    private registry: ConnectionRegistry
  ) {}

  async handle(eventObject: AnyWSEvent, ws: SignedSocket) {
    switch (eventObject.event) {
      case WSEventType.TYPING_START:
        await this.typingService.startTyping(eventObject.payload);
        break;
      case WSEventType.TYPING_STOP:
        await this.typingService.stopTyping(eventObject.payload);
      case WSEventType.PONG:
        this.registry.updateLastPong(ws);
        break;
      default:
        console.warn("WS: unhandled event", event);
    }
  }
}
