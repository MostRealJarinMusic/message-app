import { Channel, FriendRequest } from "@common/types";
import { getDB } from "../db";

export class DMChannelRepo {
  static async getDMChannels(userId: string) {}

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
