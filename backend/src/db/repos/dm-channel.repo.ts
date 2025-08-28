import { Channel, FriendRequest } from "../../../../common/types";
import { getDB } from "../db";

export class DMChannelRepo {
  static async getDMChannels(userId: string) {
    const db = await getDB();

    return new Promise<Channel[]>((resolve, reject) => {
      db.all(
        `
        SELECT * FROM direct_messages 
        INNER JOIN channels
        ON direct_messages.channelId = channels.id
        WHERE direct_messages.userId1 = ? OR direct_messages.userId2 = ?
        `,
        [userId, userId],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving DM channels:", err);
            return reject(err);
          }

          const allChannels: Channel[] = rows.map((row: any) => ({
            id: row.id,
            type: row.type,
            name: row.name,
            participants: [row.userId1, row.userId2],
          }));

          resolve(allChannels);
        }
      );
    });
  }

  static async getDMChannelParticipantIds(channelId: string) {
    const db = await getDB();

    return new Promise<string[]>((resolve, reject) => {
      db.get(
        `SELECT * FROM direct_messages WHERE channelId = ?`,
        [channelId],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row)
            return reject(
              new Error(`DM Channel with ID${channelId} not found`)
            );

          const participants: string[] = [row.userId1, row.userId2];

          resolve(participants);
        }
      );
    });
  }

  static async createDMChannel(
    channel: Channel,
    friendRequest: FriendRequest
  ): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      if (friendRequest.senderId === friendRequest.receiverId) return reject();

      if (friendRequest.senderId < friendRequest.receiverId) {
        db.run(
          `INSERT INTO direct_messages (channelId, userId1, userId2) VALUES (?, ?, ?)`,
          [channel.id, friendRequest.senderId, friendRequest.receiverId],
          function (err) {
            if (err) return reject(err);
            resolve();
          }
        );
      } else {
        db.run(
          `INSERT INTO direct_messages (channelId, userId1, userId2) VALUES (?, ?, ?)`,
          [channel.id, friendRequest.receiverId, friendRequest.senderId],
          function (err) {
            if (err) return reject(err);
            resolve();
          }
        );
      }
    });
  }
}
