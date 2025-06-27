import { Database } from 'sqlite3';

let dbInstance: Database | null = null;

export const getDB = async () => {
    if (!dbInstance) {
        dbInstance = new Database('./chat.db');
    }

    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            authorId    TEXT NOT NULL,
            channelId   INTEGER NOT NULL,
            content     TEXT NOT NULL,
            createdAt   TEXT NOT NULL,
            FOREIGN KEY (channelId) REFERENCES channels(id) ON DELETE CASCADE
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

    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );
    `)

    await dbInstance.exec(`
        INSERT OR IGNORE INTO channels (id, name) VALUES (1, "GENERAL");
    `);

    await dbInstance.exec(`
        INSERT OR IGNORE INTO channels (id, name) VALUES (2, "MEMES");
    `);

    await dbInstance.exec(`
        INSERT OR IGNORE INTO channels (id, name) VALUES (3, "BOT-COMMAND");
    `);

    

    return dbInstance;
}
