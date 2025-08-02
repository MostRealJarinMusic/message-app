import { Server } from "@common/types";
import { getDB } from "../db";

export class ServerRepo {
  static async getServers() {
    const db = await getDB();

    return new Promise<Server[]>((resolve, reject) => {
      db.all(`SELECT * FROM servers`, (err, rows) => {
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

  static async serverExists(serverId: string): Promise<boolean> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 1 FROM servers WHERE id = ? LIMIT 1`,
        [serverId],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  static async createServer(server: Server): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO servers (id, name, description) VALUES (?, ?, ?)`,
        [server.id, server.name, server.description],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  static async deleteServer(serverId: string): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM servers WHERE id = ?`, [serverId], function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static async getServer(serverId: string): Promise<Server> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
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

  static async editServer(newServer: Server) {
    const db = await getDB();

    return new Promise<void>((resolve, reject) => {
      db.run(
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
