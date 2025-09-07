//#region Auth types
export interface AuthPayload {
  token: string;
  user: User;
}
export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}
export interface UserSignature {
  id: string;
  username: string;
}

export type Timestamp = number;
//#endregion

//#region Message types
export interface Message {
  id: string;
  authorId: string;
  channelId: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  deleted?: boolean;
}

export interface MessageCreate {
  content: string;
}

export interface MessageUpdate {
  content: string;
}
//#endregion

//#region Channel types
export enum ChannelType {
  TEXT = "text",
  VOICE = "voice",
  DM = "dm",
  GROUP_DM = "group_dm",
}

export interface Channel {
  id: string;
  serverId?: string;
  name: string;
  type: ChannelType;
  topic?: string;
  createdAt?: string;
  createdBy?: string;
  editedAt?: string;
  categoryId?: string | null;
  participants?: string[];
}

export interface ChannelCreate {
  name: string;
  topic?: string;
  categoryId?: string | null;
}

export interface ChannelUpdate {
  name?: string;
  topic?: string;
  categoryId?: string;
}
//#endregion

//#region Category types
export interface ChannelCategory {
  id: string;
  serverId: string;
  name: string;
  position?: number;
}

export interface ChannelCategoryCreate {
  name: string;
}

export interface ChannelCategoryUpdate {
  name: string;
}
//#endregion

//#region Server types
export interface Server {
  id: string;
  name: string;
  description?: string;
}

export interface ServerCreate {
  name: string;
  description?: string;
}

export interface ServerUpdate {
  name: string;
  description?: string;
}

// export enum ServerAccess {
//   INVITE_ONLY = "inviteonly",
//   APPLICATION = "application",
//   DISCOVERABLE = "discoverable",
// }

export interface ServerMember {
  userId: string;
  serverId: string;
}

export interface ServerInvite {
  id: string;
  serverId: string | null;
  link: string;
  createdAt: string;
  expiresOn: string;
}

export interface ServerInvitePreview {
  serverName: string;
  totalMembers: number;
}

export interface ServerInviteCreate {
  serverId: string;
  expiresOn?: string;
}
//#endregion

//#region WebSocket types
export interface WSEvent<T extends WSEventType> {
  event: T;
  payload: WSEventPayload[T];
}

export enum WSEventType {
  RECEIVE = "message:receive",
  EDITED = "message:edited",
  DELETED = "message:deleted",

  CHANNEL_CREATE = "channel:create",
  CHANNEL_UPDATE = "channel:update",
  CHANNEL_DELETE = "channel:delete",

  CATEGORY_CREATE = "category:create",
  CATEGORY_UPDATE = "category:update",
  CATEGORY_DELETE = "category:delete",

  SERVER_CREATE = "server:create",
  SERVER_UPDATE = "server:update",
  SERVER_DELETE = "server:delete",

  SERVER_MEMBER_ADD = "server:member:add",

  PRESENCE = "presence:update",

  FRIEND_REQUEST_SENT = "friend:request:sent",
  FRIEND_REQUEST_RECEIVE = "friend:request:receive", //Request sent to receiver by sender
  FRIEND_REQUEST_UPDATE = "friend:request:update",
  FRIEND_REQUEST_DELETE = "friend:request:delete",

  FRIEND_ADD = "friend:add",

  DM_CHANNEL_CREATE = "dm:channel:create",

  PING = "ping",
  PONG = "pong",
}

export type WSEventPayload = {
  [WSEventType.RECEIVE]: Message;
  [WSEventType.EDITED]: Message;
  [WSEventType.DELETED]: Message;
  [WSEventType.CHANNEL_CREATE]: Channel;
  [WSEventType.CHANNEL_UPDATE]: Channel;
  [WSEventType.CHANNEL_DELETE]: Channel;
  [WSEventType.CATEGORY_CREATE]: ChannelCategory;
  [WSEventType.CATEGORY_UPDATE]: ChannelCategory;
  [WSEventType.CATEGORY_DELETE]: ChannelCategory;
  [WSEventType.SERVER_CREATE]: Server;
  [WSEventType.SERVER_UPDATE]: Server;
  [WSEventType.SERVER_DELETE]: Server;
  [WSEventType.SERVER_MEMBER_ADD]: ServerMember;
  [WSEventType.PRESENCE]: PresenceUpdate;
  [WSEventType.FRIEND_REQUEST_SENT]: FriendRequest;
  [WSEventType.FRIEND_REQUEST_RECEIVE]: FriendRequest;
  [WSEventType.FRIEND_REQUEST_UPDATE]: FriendRequest;
  [WSEventType.FRIEND_REQUEST_DELETE]: FriendRequest;
  [WSEventType.FRIEND_ADD]: { id: string };
  [WSEventType.DM_CHANNEL_CREATE]: Channel;
  [WSEventType.PING]: { timestamp: Timestamp };
  [WSEventType.PONG]: { timestamp: Timestamp };
};

//#endregion

//#region Presence types
export interface PresenceUpdate {
  userId: string;
  status: PresenceStatus;
}

export enum PresenceStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  AWAY = "away",
  DND = "dnd",
}
//#endregion

//#region User types
export interface User {
  id: string;
  username: string;
  email: string;
  status?: PresenceStatus;
}
//#endregion

//#region Friend and Friend request types
export interface Friendship {
  userId1: string;
  userId2: string;
  createdAt?: string;
}

export interface Friend {
  id: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
  respondedAt?: string;
}

export enum FriendRequestStatus {
  PENDING = "request:pending",
  ACCEPTED = "request:accepted",
  REJECTED = "request:rejected",
}

export interface FriendRequestCreate {
  targetUsername: string;
}

export interface FriendRequestUpdate {
  id: string;
  status: FriendRequestStatus;
}

//#endregion

//#region Navigation types
export interface NavigationNode {
  id: string;
  type:
    | "root"
    | "page"
    | "server"
    | "channel"
    | "dm_section"
    | "dm_channel"
    | "friend_section";
  label?: string;
  metadata?: Record<string, any>;
  children?: NavigationNode[];
  activeChildId?: string;
}

//#endregion

//#region Logging
export enum LoggerType {
  SERVICE_SERVER = "SERVER SERVICE",
  SERVICE_CHANNEL = "CHANNEL SERVICE",
  SERVICE_CATEGORY = "CATEGORY SERVICE",
  SERVICE_MESSAGE = "MESSAGE SERVICE",
  SERVICE_USER = "USER SERVICE",
  SERVICE_PRESENCE = "PRESENCE SERVICE",
  SERVICE_PRIVATE_API = "PRIVATE API SERVICE",
  SERVICE_PUBLIC_API = "PUBLIC API SERVICE",
  SERVICE_API = "API SERVICE",
  SERVICE_NAVIGATION = "NAVIGATION SERVICE",
  SERVICE_SOCKET = "SOCKET SERVICE",
  SERVICE_SOCKET_MANAGER = "SOCKET MANAGER SERVICE",
  SERVICE_FRIEND_REQUEST = "FRIEND REQUEST SERVICE",
  SERVICE_FRIEND = "FRIEND SERVICE",
  SERVICE_SESSION = "SESSION SERVICE",
  SERVICE_INVITE = "INVITE SERVICE",
}

//#endregion

//#region Embeds
export enum EmbedType {
  INVITE = "embed:invite",
  LINK = "embed:link",
}

export interface EmbedData {
  type: EmbedType;
  url: string;
  meta?: {
    title?: string;
    description?: string;
    image?: string;
    [key: string]: any;
  };
}

//#endregion
