import { Database } from "sqlite3";

let dbInstance: Database | null = null;

export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = new Database("./chat.db");
  }

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      authorId    TEXT NOT NULL,
      channelId   INTEGER NOT NULL,
      content     TEXT NOT NULL,
      createdAt   TEXT NOT NULL,
      FOREIGN KEY (channelId) REFERENCES channels(id) ON DELETE CASCADE
    );
  `);

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      hashedPassword TEXT NOT NULL
    );
  `);

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serverId INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (serverId) REFERENCES servers(id) ON DELETE CASCADE
    );
  `);

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );    
  `);

  //Temporary fake data

  dbInstance.exec(`
    INSERT OR IGNORE INTO servers (id, name) VALUES (1, "My Server");     
  `);

  dbInstance.exec(`
    INSERT OR IGNORE INTO channels (id, serverId, name) VALUES (1, 1, "GENERAL");
  `);

  dbInstance.exec(`
    INSERT OR IGNORE INTO channels (id, serverId, name) VALUES (2, 1, "MEMES");
  `);

  return dbInstance;
};
