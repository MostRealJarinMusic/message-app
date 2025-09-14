import { FriendRequest, FriendRequestUpdate } from "@common/types";
import { DB } from "../db";

export class FriendRequestRepo {
  constructor(private db: DB) {}

  createRequest(friendRequest: FriendRequest): Promise<void> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.run(
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

  getFriendRequestsForUser(userId: string): Promise<FriendRequest[]> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.all(
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

  getFriendRequestById(id: string): Promise<FriendRequest> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT * FROM friend_requests WHERE id = ?`,
        [id],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row)
            return reject(
              new Error(`Friend request with requestId ${id} not found`)
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

  requestExists(id: string): Promise<boolean> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT 1 FROM friend_requests WHERE id = ? LIMIT 1`,
        [id],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  requestExistsByUserIds(
    senderId: string,
    receiverId: string
  ): Promise<boolean> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT 1 FROM friend_requests WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) LIMIT 1`,
        [senderId, receiverId, receiverId, senderId],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  deleteFriendRequest(id: string): Promise<void> {
    const database = this.db.getInstance();

    return new Promise<void>((resolve, reject) => {
      database.run(
        `DELETE FROM friend_requests WHERE id = ?`,
        [id],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  updateFriendRequestStatus(requestUpdate: FriendRequestUpdate): Promise<void> {
    const database = this.db.getInstance();

    return new Promise<void>((resolve, reject) => {
      database.run(
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
