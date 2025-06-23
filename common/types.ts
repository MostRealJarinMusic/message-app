export interface AuthPayload {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}

export interface Message {
    id: string;
    authorId: string | null;
    content: string;
    createdAt: string;
    editedAt?: string;
    deleted?: boolean;
}

export interface WSEvent<T = any> {
    event: WSEventType;
    payload: T;
}

export enum WSEventType {
    SEND = "message:send",
    RECEIVE = "message:receive"
}

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

export interface User {
    id: string;
    username: string;
    email: string;
    hashedPassword: string;
    status?: PresenceStatus
}