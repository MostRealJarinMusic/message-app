import { DB } from "../db";
import { Channel } from "@common/types";

export class ChannelRepo {
  constructor(private db: DB) {}

  getChannelsByServer(serverId: string) {
    const database = this.db.getInstance();

    return new Promise<Channel[]>((resolve, reject) => {
      database.all(
        `SELECT * FROM channels WHERE serverId = ?`,
        [serverId],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving channels:", err);
            return reject(err);
          }

          const allChannels: Channel[] = rows.map((row: any) => ({
            id: row.id,
            serverId: row.serverId,
            type: row.type,
            name: row.name,
            categoryId: row.categoryId,
            topic: row.topic,
          }));

          resolve(allChannels);
        }
      );
    });
  }

  getChannelsByCategory(categoryId: string) {
    const database = this.db.getInstance();

    return new Promise<Channel[]>((resolve, reject) => {
      database.all(
        `SELECT * FROM channels WHERE categoryId = ?`,
        [categoryId],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving channels:", err);
            return reject(err);
          }

          const allChannels: Channel[] = rows.map((row: any) => ({
            id: row.id,
            serverId: row.serverId,
            type: row.type,
            name: row.name,
            categoryId: row.categoryId,
            topic: row.topic,
          }));

          resolve(allChannels);
        }
      );
    });
  }

  channelExists(channelId: string): Promise<boolean> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT 1 FROM channels WHERE id = ? LIMIT 1`,
        [channelId],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  createChannel(channel: Channel): Promise<void> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.run(
        `INSERT INTO channels (id, serverId, name, categoryId, topic, type) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          channel.id,
          channel.serverId,
          channel.name,
          channel.categoryId,
          channel.topic,
          channel.type,
        ],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  deleteChannel(channelId: string): Promise<void> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.run(
        `DELETE FROM channels WHERE id = ?`,
        [channelId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  getChannel(channelId: string): Promise<Channel> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT * FROM channels WHERE id = ?`,
        [channelId],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row)
            return reject(new Error(`Channel with ID${channelId} not found`));

          const channel: Channel = {
            id: row.id,
            serverId: row.serverId,
            type: row.type,
            name: row.name,
            categoryId: row.categoryId,
            topic: row.topic,
          };

          resolve(channel);
        }
      );
    });
  }

  editChannel(newChannel: Channel) {
    const database = this.db.getInstance();

    return new Promise<void>((resolve, reject) => {
      database.run(
        `UPDATE channels SET name = ?, categoryId = ?, topic = ? WHERE id = ?`,
        [
          newChannel.name,
          newChannel.categoryId,
          newChannel.topic,
          newChannel.id,
        ],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  addChannelParticipant(channelId: string, userId: string) {}

  getChannelParticipants(channelId: string) {}
}
