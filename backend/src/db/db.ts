import { Database } from "sqlite3";

let dbInstance: Database | null = null;

export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = new Database("./chat.db", (err) => {
      if (err) {
        console.error("Failed to load database", err);
        return;
      }

      dbInstance!.run("PRAGMA foreign_keys = ON;");
    });
  }

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id          TEXT PRIMARY KEY,
      authorId    TEXT,
      channelId   TEXT NOT NULL,
      content     TEXT NOT NULL,
      createdAt   TEXT NOT NULL,
      FOREIGN KEY (channelId) REFERENCES channels(id) ON DELETE CASCADE,
      FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id              TEXT PRIMARY KEY,
      username        TEXT NOT NULL,
      email           TEXT NOT NULL,
      hashedPassword  TEXT NOT NULL
    );
  `);

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS channels (
      id          TEXT PRIMARY KEY,
      serverId    TEXT NOT NULL,
      name        TEXT NOT NULL,
      categoryId  TEXT,
      topic       TEXT,
      FOREIGN KEY (serverId) REFERENCES servers(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES channel_categories(id) ON DELETE SET NULL
    );
  `);

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS channel_categories ( 
      id            TEXT PRIMARY KEY,
      serverId      TEXT NOT NULL,
      name          TEXT NOT NULL,
      FOREIGN KEY (serverId) REFERENCES servers(id) ON DELETE CASCADE
    );
  `);

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS servers (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      description   TEXT
    );    
  `);

  return dbInstance;
};
