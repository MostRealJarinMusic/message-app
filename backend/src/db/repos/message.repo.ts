import { DB } from "../db";
import { Message } from "@common/types";

export class MessageRepo {
  constructor(private db: DB) {}

  createMessage(message: Message): Promise<void> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.run(
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

  messageExists(messageId: string): Promise<boolean> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT 1 FROM messages WHERE id = ? LIMIT 1`,
        [messageId],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  getMessage(messageId: string): Promise<Message> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
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

  getMessagesByChannel(channelId: string) {
    const database = this.db.getInstance();

    return new Promise<Message[]>((resolve, reject) => {
      database.all(
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

  deleteMessage(messageId: string) {
    const database = this.db.getInstance();

    return new Promise<void>((resolve, reject) => {
      database.run(
        `DELETE FROM messages WHERE id = ?`,
        [messageId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  editMessage(messageId: string, newContent: string) {
    const database = this.db.getInstance();

    return new Promise<void>((resolve, reject) => {
      database.run(
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
