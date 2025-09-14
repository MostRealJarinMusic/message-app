import { Server } from "@common/types";
import { DB } from "../db";

export class ServerRepo {
  constructor(private db: DB) {}

  getAllServers() {
    const database = this.db.getInstance();

    return new Promise<Server[]>((resolve, reject) => {
      database.all(`SELECT * FROM servers`, (err, rows) => {
        if (err) {
          console.log("Error retrieving servers:", err);
          return reject(err);
        }

        const allServers: Server[] = rows.map((row: any) => ({
          id: row.id,
          name: row.name,
        }));

        resolve(allServers);
      });
    });
  }

  getServers(userId: string) {
    const database = this.db.getInstance();

    return new Promise<Server[]>((resolve, reject) => {
      database.all(
        `
        SELECT * FROM server_members
        INNER JOIN servers
        ON servers.id = server_members.serverId
        WHERE server_members.userId = ?
        `,
        [userId],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving servers:", err);
            return reject(err);
          }

          const allServers: Server[] = rows.map((row: any) => ({
            id: row.id,
            name: row.name,
          }));

          resolve(allServers);
        }
      );
    });
  }

  serverExists(serverId: string): Promise<boolean> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT 1 FROM servers WHERE id = ? LIMIT 1`,
        [serverId],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  createServer(server: Server): Promise<void> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.run(
        `INSERT INTO servers (id, name, description) VALUES (?, ?, ?)`,
        [server.id, server.name, server.description],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  deleteServer(serverId: string): Promise<void> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.run(
        `DELETE FROM servers WHERE id = ?`,
        [serverId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  getServer(serverId: string): Promise<Server> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT * FROM servers WHERE id = ?`,
        [serverId],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row)
            return reject(new Error(`Server with ID${serverId} not found`));

          const server: Server = {
            id: row.id,
            name: row.name,
            description: row.description,
          };

          resolve(server);
        }
      );
    });
  }

  editServer(newServer: Server) {
    const database = this.db.getInstance();

    return new Promise<void>((resolve, reject) => {
      database.run(
        `UPDATE servers SET name = ?, description = ? WHERE id = ?`,
        [newServer.name, newServer.description, newServer.id],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
}
