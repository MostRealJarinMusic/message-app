import { getDB } from "../db";
import { LoginCredentials, RegisterPayload, User } from "@common/types";
import bcrypt from "bcrypt";
import { ulid } from "ulid";

const SALT_ROUNDS = 10;

export class UserRepo {
  static async registerUser(payload: RegisterPayload): Promise<User> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      bcrypt.hash(payload.password, SALT_ROUNDS, (err, hashedPassword) => {
        if (err) return reject(err);

        db.get(
          `INSERT INTO users (id, username, email, hashedPassword) VALUES (?, ?, ?, ?) RETURNING *`,
          [ulid(), payload.username, payload.email, hashedPassword],
          (err, row: any) => {
            if (err) return reject(err);

            const user: User = {
              id: row.id, //Returns row ID and not the new ID
              username: row.username,
              email: row.email,
            };

            resolve(user);
          }
        );
      });
    });
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

          bcrypt.compare(
            credentials.password,
            row.hashedPassword,
            (err, result) => {
              if (err) return reject(err);
              if (!result) return resolve(null);

              const user: User = {
                id: row.id.toString(),
                username: row.username,
                email: row.email,
              };

              resolve(user);
            }
          );
        }
      );
    });
  }

  static async getUserById(id: string): Promise<User | null> {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id, username, email FROM users WHERE id = ?`,
        [id],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row) return resolve(null);

          const user: User = {
            id: row.id.toString(),
            username: row.username,
            email: row.email,
          };

          resolve(user);
        }
      );
    });
  }

  static async getAllUsers() {
    const db = await getDB();

    return new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT * FROM users`, (err, rows) => {
        if (err) {
          console.log("Error retrieving users:", err);
          return reject(err);
        }

        const allUsers: User[] = rows.map((row: any) => ({
          id: row.id,
          username: row.username,
          email: row.email,
        }));

        resolve(allUsers);
      });
    });
  }
}
