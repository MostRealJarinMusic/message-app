import { ChannelCategory } from "@common/types";
import { getDB } from "../db";

export class ChannelCategoryRepo {
  static async getCategories(serverId: string) {
    const db = await getDB();

    return new Promise<ChannelCategory[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM channel_categories WHERE serverId = ?`,
        [serverId],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving server structure:", err);
            return reject(err);
          }

          const structure: ChannelCategory[] = rows.map((row: any) => ({
            id: row.id,
            serverId: serverId,
            name: row.name,
          }));

          resolve(structure);
        }
      );
    });
  }

  static async categoryExists(categoryId: string) {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 1 FROM channel_categories WHERE id = ? LIMIT 1`,
        [categoryId],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  static async createCategory(category: ChannelCategory): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO channel_categories (id, serverId, name) VALUES (?, ?, ?)`,
        [category.id, category.serverId, category.name],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM channel_categories WHERE id = ?`,
        [categoryId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  static async getCategory(categoryId: string): Promise<ChannelCategory> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM channel_categories WHERE id = ?`,
        [categoryId],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row)
            return reject(new Error(`Category with ID${categoryId} not found`));

          const category: ChannelCategory = {
            id: row.id,
            serverId: row.serverId,
            name: row.name,
          };

          resolve(category);
        }
      );
    });
  }

  static async editCategory(newCategory: ChannelCategory) {}
}
