import { ServerMember, PublicUser } from "@common/types";
import { getDB } from "../db";

export class ServerMemberRepo {
  static async getServerMembers(serverId: string) {
    const db = await getDB();

    return new Promise<PublicUser[]>((resolve, reject) => {
      db.all(
        `
        SELECT * FROM server_members 
        INNER JOIN users
        ON users.id = server_members.userId
        WHERE serverId = ?`,
        [serverId],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving server members:", err);
            return reject(err);
          }

          const allMembers: PublicUser[] = rows.map((row: any) => ({
            id: row.id,
            username: row.username,
          }));

          resolve(allMembers);
        }
      );
    });
  }

  static async getServerMemberIds(serverId: string) {
    const db = await getDB();

    return new Promise<string[]>((resolve, reject) => {
      db.all(
        `
        SELECT * FROM server_members 
        INNER JOIN users
        ON users.id = server_members.userId
        WHERE serverId = ?`,
        [serverId],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving server members:", err);
            return reject(err);
          }

          const allMemberIds: string[] = rows.map((row: any) => row.id);

          resolve(allMemberIds);
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

    return new Promise<ServerMember | null>((resolve, reject) => {
      db.get(
        `SELECT * FROM server_members WHERE serverId = ? AND userId = ?`,
        [serverId, userId],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row) {
            resolve(null);
            return;
          }

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
