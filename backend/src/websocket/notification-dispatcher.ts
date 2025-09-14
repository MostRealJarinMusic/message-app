import {
  TypingIndicator,
  WSEventPayload,
  WSEventType,
} from "../../../common/types";
import { RelevanceService } from "../services/relevance.service";
import { EventBusPort } from "../types/types";
import { WebSocketManager } from "./websocket-manager";

export class NotificationDispatcher {
  constructor(
    private readonly relevanceService: RelevanceService,
    private readonly wsManager: WebSocketManager,
    private readonly eventBus: EventBusPort
  ) {}

  init() {
    //#region Messages
    this.eventBus.subscribe(WSEventType.MESSAGE_RECEIVE, async (payload) => {
      await this.handleChannelEvent(WSEventType.MESSAGE_RECEIVE, payload);
    });

    this.eventBus.subscribe(WSEventType.MESSAGE_EDIT, async (payload) => {
      await this.handleChannelEvent(WSEventType.MESSAGE_EDIT, payload);
    });

    this.eventBus.subscribe(WSEventType.MESSAGE_DELETE, async (payload) => {
      await this.handleChannelEvent(WSEventType.MESSAGE_DELETE, payload);
    });
    //#endregion

    //#region Channels & Categories
    this.eventBus.subscribe(WSEventType.CHANNEL_CREATE, async (payload) => {
      await this.handleServerEvent(WSEventType.CHANNEL_CREATE, payload);
    });

    this.eventBus.subscribe(WSEventType.CHANNEL_UPDATE, async (payload) => {
      await this.handleServerEvent(WSEventType.CHANNEL_UPDATE, payload);
    });

    this.eventBus.subscribe(WSEventType.CHANNEL_DELETE, async (payload) => {
      await this.handleServerEvent(WSEventType.CHANNEL_DELETE, payload);
    });

    this.eventBus.subscribe(WSEventType.CATEGORY_CREATE, async (payload) => {
      await this.handleServerEvent(WSEventType.CATEGORY_CREATE, payload);
    });

    this.eventBus.subscribe(WSEventType.CATEGORY_UPDATE, async (payload) => {
      await this.handleServerEvent(WSEventType.CATEGORY_UPDATE, payload);
    });

    this.eventBus.subscribe(WSEventType.CATEGORY_DELETE, async (payload) => {
      await this.handleServerEvent(WSEventType.CATEGORY_DELETE, payload);
    });
    //#endregion

    //#region Servers
    this.eventBus.subscribe(WSEventType.SERVER_UPDATE, async (payload) => {
      const targetIds = await this.relevanceService.getTargetIdsForServer(
        payload.id
      );

      this.wsManager.broadcastToGroup(
        WSEventType.SERVER_UPDATE,
        payload,
        targetIds
      );
    });

    this.eventBus.subscribe(WSEventType.SERVER_CREATE, async (payload) => {
      const targetIds = await this.relevanceService.getTargetIdsForServer(
        payload.id
      );

      this.wsManager.broadcastToGroup(
        WSEventType.SERVER_CREATE,
        payload,
        targetIds
      );
    });

    this.eventBus.subscribe(WSEventType.SERVER_DELETE, async (payload) => {
      const targetIds = await this.relevanceService.getTargetIdsForServer(
        payload.id
      );

      this.wsManager.broadcastToGroup(
        WSEventType.SERVER_DELETE,
        payload,
        targetIds
      );
    });

    this.eventBus.subscribe(WSEventType.SERVER_MEMBER_ADD, async (payload) => {
      const targetIds = await this.relevanceService.getTargetIdsForServer(
        payload.serverId
      );

      this.wsManager.broadcastToGroup(
        WSEventType.SERVER_MEMBER_ADD,
        payload,
        targetIds.filter((id) => id !== payload.userId)
      );
    });
    //#endregion

    //#region Presence
    this.eventBus.subscribe(WSEventType.PRESENCE, async (payload) => {
      const targetIds = await this.relevanceService.getRelevantUserIds(
        payload.userId
      );
      this.wsManager.broadcastToGroup(WSEventType.PRESENCE, payload, targetIds);
    });
    //#endregion

    //#region Friend Requests & Friends
    this.eventBus.subscribe(
      WSEventType.FRIEND_REQUEST_SENT,
      async (payload) => {
        this.wsManager.broadcastToUser(
          WSEventType.FRIEND_REQUEST_SENT,
          payload,
          payload.senderId
        );
      }
    );

    this.eventBus.subscribe(
      WSEventType.FRIEND_REQUEST_RECEIVE,
      async (payload) => {
        this.wsManager.broadcastToUser(
          WSEventType.FRIEND_REQUEST_RECEIVE,
          payload,
          payload.receiverId
        );
      }
    );

    this.eventBus.subscribe(
      WSEventType.FRIEND_REQUEST_UPDATE,
      async (payload) => {
        this.wsManager.broadcastToUser(
          WSEventType.FRIEND_REQUEST_UPDATE,
          payload,
          payload.receiverId
        );
      }
    );

    this.eventBus.subscribe(
      WSEventType.FRIEND_REQUEST_DELETE,
      async (payload) => {
        this.wsManager.broadcastToGroup(
          WSEventType.FRIEND_REQUEST_DELETE,
          payload,
          [payload.receiverId, payload.senderId]
        );
      }
    );

    this.eventBus.subscribe(WSEventType.FRIEND_ADD, async (payload) => {
      this.wsManager.broadcastToUser(
        WSEventType.FRIEND_ADD,
        payload,
        payload.targetId
      );
    });

    //#endregion

    //#region Direct Messages
    this.eventBus.subscribe(WSEventType.DM_CHANNEL_CREATE, async (payload) => {
      const targetIds = await this.relevanceService.getTargetIdsForChannel(
        payload.id
      );
      this.wsManager.broadcastToGroup(
        WSEventType.DM_CHANNEL_CREATE,
        payload,
        targetIds
      );
    });
    //#endregion

    //#region Users
    this.eventBus.subscribe(WSEventType.USER_UPDATE, async (payload) => {
      const targetIds = await this.relevanceService.getRelevantUserIds(
        payload.id
      );
      this.wsManager.broadcastToGroup(
        WSEventType.USER_UPDATE,
        payload,
        targetIds.filter((id) => id !== payload.id)
      );
    });

    this.eventBus.subscribe(WSEventType.USER_SERVER_JOIN, async (payload) => {
      this.wsManager.broadcastToGroup(WSEventType.USER_SERVER_JOIN, payload, [
        payload.userId,
      ]);
    });

    //#endregion

    //#region Typing Indicators
    this.eventBus.subscribe(WSEventType.TYPING_START, async (payload) => {
      this.handleTypingEvent(WSEventType.TYPING_START, payload);
    });

    this.eventBus.subscribe(WSEventType.TYPING_STOP, async (payload) => {
      this.handleTypingEvent(WSEventType.TYPING_STOP, payload);
    });
    //#endregion
  }

  private async handleTypingEvent<T extends WSEventType>(
    event: T,
    payload: WSEventPayload[T] & TypingIndicator
  ) {
    const targetIds = await this.relevanceService.getTargetIdsForChannel(
      payload.channelId
    );
    const filteredTargetIds = targetIds.filter((id) => id !== payload.userId);
    this.wsManager.broadcastToGroup(event, payload, filteredTargetIds);
  }

  private async handleChannelEvent<T extends WSEventType>(
    event: T,
    payload: WSEventPayload[T] & { channelId: string }
  ) {
    const targetIds = await this.relevanceService.getTargetIdsForChannel(
      payload.channelId
    );
    this.wsManager.broadcastToGroup(event, payload, targetIds);
  }

  private async handleServerEvent<T extends WSEventType>(
    event: T,
    payload: WSEventPayload[T] & { serverId?: string }
  ) {
    if (!payload.serverId) return;

    const targetIds = await this.relevanceService.getTargetIdsForServer(
      payload.serverId
    );
    this.wsManager.broadcastToGroup(event, payload, targetIds);
  }
}
