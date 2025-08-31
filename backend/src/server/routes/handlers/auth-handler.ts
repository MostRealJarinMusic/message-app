import { UserRepo } from "../../../db/repos/user.repo";
import jwt from "jsonwebtoken";
import { config } from "../../../config";
import {
  AuthPayload,
  LoginCredentials,
  RegisterPayload,
} from "../../../../../common/types";

export class AuthHandler {
  static async login(credentials: LoginCredentials): Promise<AuthPayload> {
    const user = await UserRepo.loginUser(credentials);
    if (!user) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwtSecret
    );

    return { token, user };
  }

  static async register(credentials: RegisterPayload): Promise<AuthPayload> {
    const user = await UserRepo.registerUser(credentials);
    if (!user) throw new Error("Registration failed");

    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwtSecret
    );

    return { token, user };
  }
}
