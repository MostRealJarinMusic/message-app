import { getDB } from "./db";
import { Message } from '@common/types'

export class MessageRepo {
    static async create(message: Message): Promise<void>  {
        const db = await getDB();
        
        await db.run(
            `INSERT INTO messages (id, authorId, content, createdAt) VALUES (?, ?, ?, ?)`,
            message.id, message.authorId, message.content, message.createdAt
        );


    }

    static async findAll() {
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
                        content: row.content,
                        createdAt: row.createdAt
                    }));

                    resolve(allMessages);
                }
            )
        })
    }
}