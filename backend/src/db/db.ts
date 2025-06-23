import { Database } from 'sqlite3';

let dbInstance: Database | null = null;

export const getDB = async () => {
    if (!dbInstance) {
        dbInstance = new Database('./chat.db');
    }

    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            authorId TEXT NOT NULL,
            content TEXT NOT NULL,
            createdAt TEXT NOT NULL
        );
    `)


    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            hashedPassword TEXT NOT NULL
        );
    `)

    return dbInstance;
}
