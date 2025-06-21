export interface Message {
    id: string;
    authorId: string;
    content: string;
    createdAt: string;
    editedAt?: string;
    deleted?: boolean;
}