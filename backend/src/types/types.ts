import {
  PresenceStatus,
  PresenceUpdate,
  UserSignature,
  WSEvent,
  WSEventPayload,
  WSEventType,
} from "@common/types";
import { Request } from "express";
import { UserRepo } from "../db/repos/user.repo";
import { ChannelRepo } from "../db/repos/channel.repo";
import { ChannelCategoryRepo } from "../db/repos/category.repo";
import { DMChannelRepo } from "../db/repos/dm-channel.repo";
import { FriendRequestRepo } from "../db/repos/friend-request.repo";
import { FriendRepo } from "../db/repos/friend.repo";
import { MessageRepo } from "../db/repos/message.repo";
import { ServerInviteRepo } from "../db/repos/server-invite.repo";
import { ServerMemberRepo } from "../db/repos/server-member.repo";
import { ServerRepo } from "../db/repos/server.repo";
import { CategoryService } from "../services/category.service";
import { AuthService } from "../services/auth.service";
import { RelevanceService } from "../services/relevance.service";
import { ChannelService } from "../services/channel.service";
import { DirectMessageService } from "../services/direct-message.service";
import { FriendRequestService } from "../services/friend-request.service";
import { FriendService } from "../services/friend.service";
import { InviteService } from "../services/invite.service";
import { MessageService } from "../services/message.service";
import { ServerService } from "../services/server.service";
import { UserService } from "../services/user.service";

//Local extension
export interface SignedRequest extends Request {
  signature?: UserSignature;
}

export interface Repos {
  category: ChannelCategoryRepo;
  channel: ChannelRepo;
  dmChannel: DMChannelRepo;
  friendRequest: FriendRequestRepo;
  friend: FriendRepo;
  message: MessageRepo;
  serverInvite: ServerInviteRepo;
  serverMember: ServerMemberRepo;
  server: ServerRepo;
  user: UserRepo;
}

export interface Services {
  auth: AuthService;
  category: CategoryService;
  channel: ChannelService;
  directMessage: DirectMessageService;
  friendRequest: FriendRequestService;
  friend: FriendService;
  invite: InviteService;
  message: MessageService;
  relevance: RelevanceService;
  server: ServerService;
  user: UserService;
}

//#region Adapter interfaces

export interface PresencePort {
  getSnapshot(userIds: string[]): Promise<PresenceUpdate[]>;
  updateStatus(presenceUpdate: PresenceUpdate): void;
}

//#endregion

//#region Event Bus
export interface EventBusPort {
  publish<T extends WSEventType>(
    event: T,
    payload: WSEventPayload[T],
    targetIds?: string[]
  ): void;
  subscribe<T extends WSEventType>(event: T, handler: Handler<T>): void;
}

export type Handler<T extends WSEventType> = (
  payload: WSEventPayload[T],
  targetIds?: string[]
) => void;

//#endregion
