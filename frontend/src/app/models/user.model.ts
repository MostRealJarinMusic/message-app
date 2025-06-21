import { PresenceStatus } from "./presence.model";

export interface User {
    id: string;
    username: string;
    email: string;
    hashedPassword: string;
    status?: PresenceStatus
}