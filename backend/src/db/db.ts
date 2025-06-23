import { Database } from 'sqlite3';

let dbInstance: Database | null = null;

export const getDB = async () => {
    if (!dbInstance) {
        dbInstance = new Database('./chat.db');
    }

    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            authorId TEXT NOT NULL,
            content TEXT NOT NULL,
            createdAt TEXT NOT NULL
        );
    `)

    return dbInstance;
}
