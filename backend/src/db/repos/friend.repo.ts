import { getDB } from "db/db";

export class FriendRepo {
  static async getFriends(id: string): Promise<string[]> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.all(
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

          const friendIds: string[] = rows.map((row: any) => row);

          resolve(friendIds);
        }
      );
    });
  }

  static async addFriend(id: string, friendId: string): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      if (id === friendId) return reject();

      if (id < friendId) {
        db.run(
          `INSERT INTO friendships (userId1, userId2, createdAt) VALUES (?, ?, ?)`,
          [id, friendId, new Date().toISOString()],
          function (err) {
            if (err) return reject(err);
            resolve();
          }
        );
      } else {
        db.run(
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

  static async friendshipExists(id: string, otherId: string): Promise<boolean> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
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
