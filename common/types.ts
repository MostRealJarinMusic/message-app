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
  serverId: string;
  name: string;
  type: ChannelType;
  topic?: string;
  createdAt?: string;
  createdBy?: string;
  editedAt?: string;
  categoryId?: string | null;
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
  serverId: string;
  link: string;
  createdAt: string;
  expiresOn: string;
  valid: boolean;
}
//#endregion

//#region WebSocket types
export interface WSEvent<T = any> {
  event: WSEventType;
  payload: T;
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

  PRESENCE = "presence:update",

  FRIEND_REQUEST_SENT = "friend:request:sent",
  // FRIEND_REQUEST_ACCEPTED = "friend:request:accepted", //Request accepted by receiver
  // FRIEND_REQUEST_CANCELLED = "friend:request:cancelled", //Request cancelled by sender
  // FRIEND_REQUEST_REJECTED = "friend:request:rejected", //Request rejected by receiver

  FRIEND_REQUEST_RECEIVE = "friend:request:receive", //Request sent to receiver by sender
  // FRIEND_REQUEST_ACCEPT = "friend:request:accept",
  // FRIEND_REQUEST_CANCEL = "friend:request:cancel", //Request sent to receiver by sender
  // FRIEND_REQUEST_REJECT = "friend:request:reject",
  FRIEND_REQUEST_UPDATE = "friend:request:update",
  FRIEND_REQUEST_DELETE = "friend:request:delete",

  FRIEND_ADD = "friend:add",
  FRIEND_BLOCK = "friend:block",

  PING = "ping",
  PONG = "pong",
}
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
  targetId: string;
}

export interface FriendRequestUpdate {
  id: string;
  status: FriendRequestStatus;
}

//#endregion
