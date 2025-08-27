import { ServerMember } from "@common/types";
import { getDB } from "../db";

export class ServerMmeberRepo {
  static async getServerMembers(serverId: string) {
    const db = await getDB();

    return new Promise<ServerMember[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM server_members WHERE serverId = ?`,
        [serverId],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving server members:", err);
            return reject(err);
          }

          const allMembers: ServerMember[] = rows.map((row: any) => ({
            userId: row.userId,
            serverId: row.serverId,
          }));

          resolve(allMembers);
        }
      );
    });
  }

  static async addServerMember(member: ServerMember): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO server_members (userId, serverId) VALUES (?, ?)`,
        [member.userId, member.serverId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  static async getServerMember(serverId: string, userId: string) {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM server_members WHERE serverId = ? AND userId = ?`,
        [serverId, userId],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row) return reject(new Error(`Server member not found`));

          const member: ServerMember = {
            userId: row.userId,
            serverId: row.serverId,
          };

          resolve(member);
        }
      );
    });
  }
}
