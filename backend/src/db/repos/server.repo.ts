import { ChannelCategory, Server } from "@common/types";
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
    return false;
  }

  static async createServer(server: Server) {}

  static async deleteServer(server: Server) {}

  static async getServver(serverId: string) {}

  static async editServer(serverId: string) {}
}
