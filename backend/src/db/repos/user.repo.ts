import { DB } from "../db";
import {
  LoginCredentials,
  RegisterPayload,
  PrivateUser,
  PublicUser,
} from "@common/types";
import bcrypt from "bcrypt";
import { ulid } from "ulid";

const SALT_ROUNDS = 10;

export class UserRepo {
  constructor(private db: DB) {}

  registerUser(payload: RegisterPayload): Promise<PrivateUser> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      bcrypt.hash(payload.password, SALT_ROUNDS, (err, hashedPassword) => {
        if (err) return reject(err);

        database.get(
          `INSERT INTO users (id, username, email, bio, hashedPassword) VALUES (?, ?, ?, ?, ?) RETURNING *`,
          [ulid(), payload.username, payload.email, "", hashedPassword],
          (err, row: any) => {
            if (err) return reject(err);

            const user: PrivateUser = {
              id: row.id, //Returns row ID and not the new ID
              username: row.username,
              email: row.email,
              bio: row.bio,
            };

            resolve(user);
          }
        );
      });
    });
  }

  loginUser(credentials: LoginCredentials): Promise<PrivateUser | null> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
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

              const user: PrivateUser = {
                id: row.id.toString(),
                username: row.username,
                email: row.email,
                bio: row.bio,
              };

              resolve(user);
            }
          );
        }
      );
    });
  }

  getMe(id: string): Promise<PrivateUser | null> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT * FROM users WHERE id = ?`,
        [id],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row) return resolve(null);

          const user: PrivateUser = {
            id: row.id.toString(),
            username: row.username,
            email: row.email,
            bio: row.bio,
          };

          resolve(user);
        }
      );
    });
  }

  getUserById(id: string): Promise<PublicUser | null> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT * FROM users WHERE id = ?`,
        [id],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row) return resolve(null);

          const user: PublicUser = {
            id: row.id.toString(),
            username: row.username,
            bio: row.bio,
          };

          resolve(user);
        }
      );
    });
  }

  getUserByUsername(username: string): Promise<PublicUser | null> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        (err, row: any) => {
          if (err) return reject(err);
          if (!row) return resolve(null);

          const user: PublicUser = {
            id: row.id.toString(),
            username: row.username,
            bio: row.bio,
          };

          resolve(user);
        }
      );
    });
  }

  userExists(id: string): Promise<boolean> {
    const database = this.db.getInstance();

    return new Promise((resolve, reject) => {
      database.get(
        `SELECT 1 FROM users WHERE id = ? LIMIT 1`,
        [id],
        (err, row) => {
          if (err) return reject(err);
          resolve(!!row);
        }
      );
    });
  }

  getAllUsers() {
    const database = this.db.getInstance();

    return new Promise<PublicUser[]>((resolve, reject) => {
      database.all(`SELECT * FROM users`, (err, rows) => {
        if (err) {
          console.log("Error retrieving users:", err);
          return reject(err);
        }

        const allUsers: PublicUser[] = rows.map((row: any) => ({
          id: row.id,
          username: row.username,
          bio: row.bio,
        }));

        resolve(allUsers);
      });
    });
  }

  updateUser(updatedUser: PrivateUser) {
    const database = this.db.getInstance();

    return new Promise<void>((resolve, reject) => {
      database.run(
        `UPDATE users SET bio = ? WHERE id = ?`,
        [updatedUser.bio, updatedUser.id],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
}
