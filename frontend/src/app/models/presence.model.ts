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