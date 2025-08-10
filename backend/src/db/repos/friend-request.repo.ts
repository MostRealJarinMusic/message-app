import { FriendRequest, FriendRequestUpdate } from "@common/types";
import { getDB } from "../db";

export class FriendRequestRepo {
  static async createRequest(friendRequest: FriendRequest): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO friend_requests (id, senderId, receiverId, status, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [
          friendRequest.id,
          friendRequest.senderId,
          friendRequest.receiverId,
          friendRequest.status,
          friendRequest.createdAt,
        ],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  static async getFriendRequestsForUser(
    userId: string
  ): Promise<FriendRequest[]> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM friend_requests WHERE senderId = ? OR receiverId = ?`,
        [userId, userId],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving friend requests:", err);
            return reject(err);
          }

          const allRequests: FriendRequest[] = rows.map((row: any) => ({
            id: row.id,
            senderId: row.senderId,
            receiverId: row.receiverId,
            status: row.status,
            createdAt: row.createdAt,
          }));

          resolve(allRequests);
        }
      );
    });
  }

  static async getFriendRequestById(id: string): Promise<FriendRequest> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM friend_requests WHERE id = ?`,
        [id],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row)
            return reject(
              new Error(`Friend request with senderId ${id} not found`)
            );

          const friendRequest: FriendRequest = {
            id: row.id,
            senderId: row.senderId,
            receiverId: row.receiverId,
            status: row.status,
            createdAt: row.createdAt,
          };

          resolve(friendRequest);
        }
      );
    });
  }

  static async requestExists(id: string): Promise<boolean> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 1 FROM friend_requests WHERE id = ? LIMIT 1`,
        [id],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  static async deleteFriendRequest(id: string): Promise<void> {
    const db = await getDB();

    return new Promise<void>((resolve, reject) => {
      db.run(`DELETE FROM friend_requests WHERE id = ?`, [id], function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static async updateFriendRequestStatus(
    requestUpdate: FriendRequestUpdate
  ): Promise<void> {
    const db = await getDB();

    return new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE friend_requests SET status = ? WHERE id = ?`,
        [requestUpdate.status, requestUpdate.id],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
}
