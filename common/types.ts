//Auth types
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
    id: string,
    username: string
}

export type Timestamp = number;

//Message, Channel, Server types
export interface Message {
    id: string;
    authorId: string;
    channelId: string;
    content: string;
    createdAt: string;
    editedAt?: string;
    deleted?: boolean;
}

export interface Channel {
    id: string;
    name: string;
    topic?: string;
    createdAt?: string;
    createdBy?: string;
    editedAt?: string;
}

export interface Server {
    id: string;
    name: string;
}

export interface ServerMember {
    userId: string;
    serverId: string;
    roles?: string[];
}



//WebSocket types
export interface WSEvent<T = any> {
    event: WSEventType;
    payload: T;
}

export enum WSEventType {
    SEND = "message:send",
    EDIT = "message:edit",
    DELETE = "message:delete",
    RECEIVE = "message:receive",
    EDITED = "message:edited",
    DELETED = "message:deleted",
    PRESENCE = "presence:update",
    PING = "ping",
    PONG = "pong"
}

//Presence types
export interface PresenceUpdate {
    userId: string;
    status: PresenceStatus;
}

export enum PresenceStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    AWAY = 'away',
    DND = 'dnd'
}

//User types
export interface User {
    id: string;
    username: string;
    email: string;
    status?: PresenceStatus
}
