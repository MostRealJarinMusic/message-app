import { ChannelCategory } from "@common/types";
import { DB } from "../db";

export class ChannelCategoryRepo {
  constructor(private db: DB) {}

  getCategories(serverId: string) {
    const database = this.db.getInstance();

    return new Promise<ChannelCategory[]>((resolve, reject) => {
      database.all(
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

  categoryExists(categoryId: string) {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT 1 FROM channel_categories WHERE id = ? LIMIT 1`,
        [categoryId],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  createCategory(category: ChannelCategory): Promise<void> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.run(
        `INSERT INTO channel_categories (id, serverId, name) VALUES (?, ?, ?)`,
        [category.id, category.serverId, category.name],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  deleteCategory(categoryId: string): Promise<void> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.run(
        `DELETE FROM channel_categories WHERE id = ?`,
        [categoryId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  getCategory(categoryId: string): Promise<ChannelCategory> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
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

  editCategory(newCategory: ChannelCategory) {
    const database = this.db.getInstance();

    return new Promise<void>((resolve, reject) => {
      database.run(
        `UPDATE channel_categories SET name = ? WHERE id = ?`,
        [newCategory.name, newCategory.id],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
}
