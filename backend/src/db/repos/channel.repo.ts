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
            name: row.name,
            categoryId: row.categoryId,
          }));

          resolve(allChannels);
        }
      );
    });
  }

  static async createChannel(channel: Channel): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO channels (id, serverId, name, categoryId) VALUES (?, ?, ?, ?)`,
        [channel.id, channel.serverId, channel.name, channel.categoryId],
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
            name: row.name,
            categoryId: row.categoryId,
          };

          resolve(channel);
        }
      );
    });
  }

  // static async editChannel(newChannel: Channel) {
  //   const db = await getDB();

  //   return new Promise((resolve, reject) => {
  //     db.run(
  //       `UPDATE channel SET name = ?, categoryId = ? WHERE id = ?`,
  //       [newChannel.name, newChannel.categoryId, newChannel.id];
  //     )
  //   })
  // }
}
