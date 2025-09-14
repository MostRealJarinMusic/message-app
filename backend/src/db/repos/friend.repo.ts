import { DB } from "../db";

export class FriendRepo {
  constructor(private db: DB) {}

  getFriends(id: string): Promise<string[]> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.all(
        `SELECT 
          CASE 
            WHEN userId1 = ? THEN userId2
            ELSE userId1
          END AS friendId
        FROM friendships
        WHERE userId1 = ? OR userId2 = ?`,
        [id, id, id],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving friends:", err);
            return reject(err);
          }

          const friendIds: string[] = rows.map((row: any) => row.friendId);

          resolve(friendIds);
        }
      );
    });
  }

  addFriend(id: string, friendId: string): Promise<void> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      if (id === friendId) return reject();

      if (id < friendId) {
        database.run(
          `INSERT INTO friendships (userId1, userId2, createdAt) VALUES (?, ?, ?)`,
          [id, friendId, new Date().toISOString()],
          function (err) {
            if (err) return reject(err);
            resolve();
          }
        );
      } else {
        database.run(
          `INSERT INTO friendships (userId1, userId2, createdAt) VALUES (?, ?, ?)`,
          [friendId, id, new Date().toISOString()],
          function (err) {
            if (err) return reject(err);
            resolve();
          }
        );
      }
    });
  }

  friendshipExists(id: string, otherId: string): Promise<boolean> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT 1 FROM friendships WHERE (userId1 = ? AND userId2 = ?) OR (userId1 = ? AND userId2 = ?) LIMIT 1`,
        [id, otherId, otherId, id],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }
}
