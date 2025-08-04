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
}
