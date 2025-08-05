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

  static async getFriendRequest(
    senderId: string,
    receiverId: string
  ): Promise<FriendRequest> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM friend_requests WHERE senderId = ? AND receiverId = ?`,
        [senderId, receiverId],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row)
            return reject(
              new Error(
                `Friend request with senderId ${senderId} and receiverId ${receiverId} not found`
              )
            );

          const friendRequest: FriendRequest = {
            senderId: row.senderId,
            receiverId: row.receiverId,
            createdAt: row.createdAt,
          };

          resolve(friendRequest);
        }
      );
    });
  }

  static async requestExists(
    senderId: string,
    receiverId: string
  ): Promise<boolean> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 1 FROM friend_requests WHERE senderId = ? AND receiverId = ? LIMIT 1`,
        [senderId, receiverId],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  static async deleteFriendRequest(
    senderId: string,
    receiverId: string
  ): Promise<void> {
    const db = await getDB();

    return new Promise<void>((resolve, reject) => {
      db.run(
        `DELETE FROM friend_requests WHERE senderId = ? AND receiverId = ?`,
        [senderId, receiverId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
}
