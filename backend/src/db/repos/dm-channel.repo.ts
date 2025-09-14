import { Channel, FriendRequest } from "../../../../common/types";
import { DB } from "../db";

export class DMChannelRepo {
  constructor(private db: DB) {}

  getDMChannels(userId: string) {
    const database = this.db.getInstance();

    return new Promise<Channel[]>((resolve, reject) => {
      database.all(
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

  getDMChannelParticipantIds(channelId: string) {
    const database = this.db.getInstance();

    return new Promise<string[]>((resolve, reject) => {
      database.get(
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

  createDMChannel(
    channel: Channel,
    friendRequest: FriendRequest
  ): Promise<void> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      if (friendRequest.senderId === friendRequest.receiverId) return reject();

      if (friendRequest.senderId < friendRequest.receiverId) {
        database.run(
          `INSERT INTO direct_messages (channelId, userId1, userId2) VALUES (?, ?, ?)`,
          [channel.id, friendRequest.senderId, friendRequest.receiverId],
          function (err) {
            if (err) return reject(err);
            resolve();
          }
        );
      } else {
        database.run(
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
