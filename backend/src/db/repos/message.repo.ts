import { ulid } from "ulid";
import { getDB } from "../db";
import { Message } from "@common/types";

export class MessageRepo {
  static async createMessage(message: Message): Promise<void> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO messages (id, authorId, channelId, content, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [
          message.id,
          message.authorId,
          message.channelId,
          message.content,
          message.createdAt,
        ],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  static async messageExists(messageId: string): Promise<boolean> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 1 FROM messages WHERE id = ? LIMIT 1`,
        [messageId],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  static async getMessage(messageId: string): Promise<Message> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM messages WHERE id = ?`,
        [messageId],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row)
            return reject(new Error(`Message with ID${messageId} not found}`));

          const message: Message = {
            id: row.id,
            authorId: row.authorId,
            channelId: row.channelId,
            content: row.content,
            createdAt: row.createdAt,
          };

          resolve(message);
        }
      );
    });
  }

  static async getAllMessages() {
    const db = await getDB();

    return new Promise<Message[]>((resolve, reject) => {
      db.all(`SELECT * FROM messages ORDER BY createdAt ASC`, (err, rows) => {
        if (err) {
          console.log("Error retrieving messages:", err);
          return reject(err);
        }

        const allMessages: Message[] = rows.map((row: any) => ({
          id: row.id,
          authorId: row.authorId,
          channelId: row.channelId,
          content: row.content,
          createdAt: row.createdAt,
        }));

        resolve(allMessages);
      });
    });
  }

  static async getAllChannelMessages(channelId: string) {
    const db = await getDB();

    return new Promise<Message[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM messages WHERE channelId = ? ORDER BY createdAt ASC`,
        [channelId],
        (err, rows) => {
          if (err) {
            console.log("Error retrieving messages:", err);
            return reject(err);
          }

          const allMessages: Message[] = rows.map((row: any) => ({
            id: row.id,
            authorId: row.authorId,
            channelId: row.channelId,
            content: row.content,
            createdAt: row.createdAt,
          }));

          resolve(allMessages);
        }
      );
    });
  }

  static async deleteMessage(messageId: string) {
    const db = await getDB();

    return new Promise<void>((resolve, reject) => {
      db.run(`DELETE FROM messages WHERE id = ?`, [messageId], function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static async editMessage(messageId: string, newContent: string) {
    const db = await getDB();

    return new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE messages SET content = ?  WHERE id = ?`,
        [newContent, messageId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
}
