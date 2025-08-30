import { ServerInvite } from "@common/types";
import { getDB } from "../db";

export class ServerInviteRepo {
  static async getServerInvites(serverId: string) {
    const db = await getDB();

    return new Promise<ServerInvite[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM server_invites WHERE serverId = ?`,
        [serverId],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving server invites:", err);
            return reject(err);
          }

          const allInvites: ServerInvite[] = rows.map((row: any) => ({
            id: row.id,
            serverId: row.serverId,
            link: row.link,
            createdAt: row.createdAt,
            expiresOn: row.expiresOn,
          }));

          resolve(allInvites);
        }
      );
    });
  }

  static async createServerInvite(invite: ServerInvite): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO server_invites (id, serverId, link, createdAt, expiresOn) VALUES (?, ?, ?, ?, ?)`,
        [
          invite.id,
          invite.serverId,
          invite.link,
          invite.createdAt,
          invite.expiresOn,
        ],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  static async getServerInvite(inviteId: string): Promise<ServerInvite> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM server_invites WHERE id = inviteId`,
        [inviteId],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row) return reject(new Error(`Server invite not found`));

          const invite: ServerInvite = {
            id: row.id,
            serverId: row.serverId,
            link: row.link,
            createdAt: row.createdAt,
            expiresOn: row.expiresOn,
          };

          resolve(invite);
        }
      );
    });
  }
}
