import { getDB } from "../db";
import { Channel } from "@common/types";

export class ChannelRepo {
  static async getChannels(serverId: string) {
    const db = await getDB();

    return new Promise<Channel[]>((resolve, reject) => {
      db.all(
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

  static async channelExists(channelId: string): Promise<boolean> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 1 FROM channels WHERE id = ? LIMIT 1`,
        [channelId],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  static async createChannel(channel: Channel): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.run(
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

  static async deleteChannel(channelId: string): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM channels WHERE id = ?`, [channelId], function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static async getChannel(channelId: string): Promise<Channel> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
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

  static async editChannel(newChannel: Channel) {
    const db = await getDB();

    return new Promise<void>((resolve, reject) => {
      db.run(
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

  static async addChannelParticipant(channelId: string, userId: string) {}

  static async getChannelParticipants(channelId: string) {}
}
