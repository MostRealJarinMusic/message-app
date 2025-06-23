import { getDB } from "./db";
import { LoginCredentials, RegisterPayload, User } from "@common/types";
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class UserRepo {
    static async registerUser(payload: RegisterPayload): Promise<User> {
        const db = await getDB();

        return new Promise((resolve, reject) => {
            bcrypt.hash(payload.password, SALT_ROUNDS, (err, hashedPassword) => {
                if (err) return reject(err);

                db.run(
                    `INSERT INTO users (username, email, hashedPassword) VALUES (?, ?, ?)`,
                    [payload.username, payload.email, hashedPassword],
                    function (err) {
                        if (err) return reject(err);
                        
                        const user: User = {
                            id: this.lastID.toString(),
                            username: payload.username,
                            email: payload.email
                        };

                        resolve(user);
                    }
                )

            })
        })
    }

    static async loginUser(credentials: LoginCredentials): Promise<User | null> {
        const db = await getDB();

        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM users WHERE username = ?`,
                [credentials.username],
                (err, row: any) => {
                    if (err) return reject(err);
                    if (!row) return resolve(null);
                    
                    bcrypt.compare(credentials.password, row.hashedPassword, (err, result) => {
                        if (err) return reject(err);
                        if (!result) return resolve(null);
                        
                        const user: User = {
                            id: row.id.toString(),
                            username: row.username,
                            email: row.email
                        }

                        resolve(user);
                    })

                }
            )
        })
    }
    
}