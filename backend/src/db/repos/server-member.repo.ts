import { ServerMember, PublicUser } from "@common/types";
import { DB } from "../db";

export class ServerMemberRepo {
  constructor(private db: DB) {}

  getServerMembers(serverId: string) {
    const database = this.db.getInstance();

    return new Promise<PublicUser[]>((resolve, reject) => {
      database.all(
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
            bio: row.bio,
          }));

          resolve(allMembers);
        }
      );
    });
  }

  getServerMemberIds(serverId: string) {
    const database = this.db.getInstance();

    return new Promise<string[]>((resolve, reject) => {
      database.all(
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

  getServerMemberIdsByServerIds(serverIds: string[]): Promise<string[]> {
    if (serverIds.length === 0) return Promise.resolve([]);

    const database = this.db.getInstance();

    return new Promise<string[]>((resolve, reject) => {
      const placeholders = serverIds.map(() => "?").join(",");
      database.all(
        `SELECT userId FROM server_members WHERE serverId IN (${placeholders})`,
        serverIds,
        (err, rows) => {
          if (err) return reject(err);
          const allMemberIds = rows.map((row: any) => row.userId);
          resolve(allMemberIds);
        }
      );
    });
  }

  addServerMember(member: ServerMember): Promise<void> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.run(
        `INSERT INTO server_members (userId, serverId) VALUES (?, ?)`,
        [member.userId, member.serverId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  getServerMember(serverId: string, userId: string) {
    const database = this.db.getInstance();

    return new Promise<ServerMember | null>((resolve, reject) => {
      database.get(
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
