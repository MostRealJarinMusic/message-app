import { Database } from "sqlite3";
import { ulid } from "ulid";

//Temporary
const serverId = ulid();
const category1Id = ulid();
const category2Id = ulid();

const generalChannelId = ulid();
const memesChannelId = ulid();
const botCommandsChannelId = ulid();

const server2Id = ulid();

const category3Id = ulid();
const category4Id = ulid();
const announcementsChannelId = ulid();
const offTopicChannelId = ulid();
const gamesChannelId = ulid();

let dbInstance: Database | null = null;

export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = new Database("./chat.db");
  }

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id          TEXT PRIMARY KEY,
      authorId    TEXT NOT NULL,
      channelId   TEXT NOT NULL,
      content     TEXT NOT NULL,
      createdAt   TEXT NOT NULL,
      FOREIGN KEY (channelId) REFERENCES channels(id) ON DELETE CASCADE
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
      FOREIGN KEY (serverId) REFERENCES servers(id) ON DELETE CASCADE
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

  //Temporary fake data

  // dbInstance.exec(`
  //   INSERT OR IGNORE INTO servers (id, name)
  //   VALUES ("${serverId}", "My Server");
  // `);

  // dbInstance.exec(`
  //   INSERT OR IGNORE INTO channel_categories (id, serverId, name)
  //   VALUES
  //     ('${category1Id}', '${serverId}', 'Text Channels'),
  //     ('${category2Id}', '${serverId}', 'Fun Stuff');
  // `);

  // dbInstance.exec(`
  //   INSERT OR IGNORE INTO channels (id, serverId, name, categoryId, topic)
  //   VALUES
  //     ('${generalChannelId}', '${serverId}', 'General', '${category1Id}', NULL),
  //     ('${memesChannelId}', '${serverId}', 'Memes', '${category2Id}', NULL),
  //     ('${botCommandsChannelId}', '${serverId}', 'Bot Commands', NULL, NULL);
  // `);

  // dbInstance.exec(`
  //   INSERT OR IGNORE INTO servers (id, name)
  //   VALUES ('${server2Id}', 'Fun Server');
  // `);

  // dbInstance.exec(`
  //   INSERT OR IGNORE INTO channels (id, serverId, name)
  //   VALUES
  //     ('${announcementsChannelId}', '${server2Id}', 'Announcements'),
  //     ('${offTopicChannelId}', '${server2Id}', 'Off-Topic'),
  //     ('${gamesChannelId}', '${server2Id}', 'Games');
  // `);

  return dbInstance;
};
