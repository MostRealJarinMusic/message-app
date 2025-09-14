import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";

export class DB {
  private db: Database;

  constructor(filePath: string = "./chat.db") {
    this.db = new Database(filePath, (err) => {
      if (err) {
        console.log("Failed to load database");
        throw err;
      }
    });
  }

  getInstance() {
    return this.db;
  }

  async init(): Promise<void> {
    const asyncExec = (sql: string) =>
      new Promise<void>((resolve, reject) =>
        this.db.exec(sql, (err) => (err ? reject(err) : resolve()))
      );

    await asyncExec("PRAGMA foreign_keys = ON;");

    await asyncExec(`
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

    await asyncExec(`
      CREATE TABLE IF NOT EXISTS users (
        id              TEXT PRIMARY KEY,
        username        TEXT NOT NULL,
        email           TEXT NOT NULL,
        bio             TEXT,
        hashedPassword  TEXT NOT NULL
      );
    `);

    await asyncExec(`
      CREATE TABLE IF NOT EXISTS friendships (
        userId1           TEXT NOT NULL,
        userId2           TEXT NOT NULL,
        createdAt         TEXT,
        CHECK (userId1 < userId2),
        PRIMARY KEY (userId1, userId2),
        FOREIGN KEY (userId1) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (userId2) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await asyncExec(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id              TEXT PRIMARY KEY,
        senderId        TEXT NOT NULL,
        receiverId      TEXT NOT NULL,
        status          TEXT NOT NULL,
        createdAt       TEXT NOT NULL,
        respondedAt     TEXT,
        UNIQUE (senderId, receiverId),
        FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await asyncExec(`
      CREATE TABLE IF NOT EXISTS channels (
        id          TEXT PRIMARY KEY,
        serverId    TEXT,
        name        TEXT NOT NULL,
        type        TEXT NOT NULL,
        categoryId  TEXT,
        topic       TEXT,
        FOREIGN KEY (serverId) REFERENCES servers(id) ON DELETE CASCADE,
        FOREIGN KEY (categoryId) REFERENCES channel_categories(id) ON DELETE SET NULL
      );
    `);

    await asyncExec(`
      CREATE TABLE IF NOT EXISTS channel_categories ( 
        id            TEXT PRIMARY KEY,
        serverId      TEXT NOT NULL,
        name          TEXT NOT NULL,
        FOREIGN KEY (serverId) REFERENCES servers(id) ON DELETE CASCADE
      );
    `);

    await asyncExec(`
      CREATE TABLE IF NOT EXISTS channel_participants (
        channelId       TEXT NOT NULL,
        userId          TEXT NOT NULL,
        PRIMARY KEY (channelId, userId),
        FOREIGN KEY (channelId) REFERENCES channels(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );  
    `);

    await asyncExec(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        channelId       TEXT PRIMARY KEY,
        userId1         TEXT NOT NULL,
        userId2         TEXT NOT NULL,
        CHECK (userId1 < userId2),
        UNIQUE (userId1, userId2),
        FOREIGN KEY (channelId) REFERENCES channels(id) ON DELETE CASCADE,
        FOREIGN KEY (userId1) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (userId2) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await asyncExec(`
      CREATE TABLE IF NOT EXISTS servers (
        id            TEXT PRIMARY KEY,
        name          TEXT NOT NULL,
        description   TEXT
      );    
    `);

    await asyncExec(`
      CREATE TABLE IF NOT EXISTS server_members (
        userId        TEXT NOT NULL,
        serverId      TEXT NOT NULL,
        PRIMARY KEY (userId, serverId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (serverId) REFERENCES servers(id) ON DELETE CASCADE
      );
    `);

    await asyncExec(`
      CREATE TABLE IF NOT EXISTS server_invites (
        id              TEXT PRIMARY KEY,
        serverId        TEXT,
        link            TEXT NOT NULL,
        createdAt       TEXT NOT NULL,
        expiresOn       TEXT NOT NULL,
        FOREIGN KEY (serverId) REFERENCES servers(id) ON DELETE SET NULL
      );
    `);
  }
}
