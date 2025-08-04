import { FriendRequest } from "@common/types";
import { getDB } from "db/db";

export class FriendRequestRepo {
  static async createRequest(friendRequest: FriendRequest): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO friend_requests (senderId, receiverId, createdAt) VALUES (?, ?, ?)`,
        [
          friendRequest.senderId,
          friendRequest.receiverId,
          friendRequest.createdAt,
        ],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  static async getFriendRequests(id: string): Promise<FriendRequest[]> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM friend_requests WHERE senderId = ? OR receiverId = ?`,
        [id, id],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving friend requests:", err);
            return reject(err);
          }

          const allRequests: FriendRequest[] = rows.map((row: any) => ({
            senderId: row.senderId,
            receiverId: row.receiverId,
            createdAt: row.createdAt,
          }));

          resolve(allRequests);
        }
      );
    });
  }

  static async deleteFriendRequest(
    friendRequest: FriendRequest
  ): Promise<void> {
    const db = await getDB();

    return new Promise<void>((resolve, reject) => {
      db.run(
        `DELETE FROM friend_requests WHERE senderId = ? AND receiverId = ?`,
        [friendRequest.senderId, friendRequest.receiverId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
}
