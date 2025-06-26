import { getDB } from "./db";
import { Message } from '@common/types'

export class MessageRepo {
    static async insertMessage(message: Partial<Message>): Promise<number> {
        const db = await getDB();

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO messages (authorId, channelId, content, createdAt) VALUES (?, ?, ?, ?)`,
                [message.authorId, message.channelId, message.content, message.createdAt],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.lastID)
                }
            )
        })
    }

    static async getAllMessages() {
        const db = await getDB();
        
        return new Promise<Message[]>((resolve, reject) => {
             db.all(
                `SELECT * FROM messages ORDER BY createdAt ASC`,
                (err, rows) => {
                    if (err) {
                        console.log("Error retrieving messages:", err);
                        return reject(err)
                    }

                    const allMessages: Message[] = rows.map((row: any) => ({
                        id: row.id,
                        authorId: row.authorId,
                        channelId: row.channelId,
                        content: row.content,
                        createdAt: row.createdAt
                    }));

                    resolve(allMessages);
                }
            )
        })
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
                        return reject(err)
                    }

                    const allMessages: Message[] = rows.map((row: any) => ({
                        id: row.id,
                        authorId: row.authorId,
                        channelId: row.channelId,
                        content: row.content,
                        createdAt: row.createdAt
                    }));

                    resolve(allMessages);
                }
            )
        })
    }
}