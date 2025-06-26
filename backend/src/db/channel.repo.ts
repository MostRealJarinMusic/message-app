import { getDB } from "./db";
import { Channel } from '@common/types'

export class ChannelRepo {
    static async getChannels() {
        const db = await getDB();
        
        return new Promise<Channel[]>((resolve, reject) => {
             db.all(
                `SELECT * FROM channels`,
                (err, rows) => {
                    if (err) {
                        console.log("Error retrieving channels:", err);
                        return reject(err)
                    }

                    const allChannels: Channel[] = rows.map((row: any) => ({
                        id: row.id,
                        name: row.name
                    }));

                    resolve(allChannels);
                }
            )
        })
    }
}