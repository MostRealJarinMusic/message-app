import { ServerInvite } from "@common/types";
import { DB } from "../db";

export class ServerInviteRepo {
  constructor(private db: DB) {}

  getServerInvites(serverId: string) {
    const database = this.db.getInstance();

    return new Promise<ServerInvite[]>((resolve, reject) => {
      database.all(
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

  createServerInvite(invite: ServerInvite): Promise<void> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.run(
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

  getServerInviteById(inviteId: string): Promise<ServerInvite> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT * FROM server_invites WHERE id = ?`,
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

  getServerInviteByLink(inviteLink: string): Promise<ServerInvite> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT * FROM server_invites WHERE link = ?`,
        [inviteLink],
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

  deleteServerInvite(inviteId: string): Promise<void> {
    const database = this.db.getInstance();

    return new Promise<void>((resolve, reject) => {
      database.run(
        `DELETE FROM server_invites WHERE id = ?`,
        [inviteId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
}
