export interface Message {
    id: string;
    authorId: string | null;
    content: string;
    createdAt: Date;
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