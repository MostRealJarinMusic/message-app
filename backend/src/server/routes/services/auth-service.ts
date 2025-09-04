import { UserRepo } from "../../../db/repos/user.repo";
import jwt from "jsonwebtoken";
import { config } from "../../../config";
import {
  AuthPayload,
  LoginCredentials,
  RegisterPayload,
} from "../../../../../common/types";
import { BadRequestError, UnauthorizedError } from "../../../errors/errors";

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthPayload> {
    const user = await UserRepo.loginUser(credentials);
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwtSecret
    );

    return { token, user };
  }

  static async register(credentials: RegisterPayload): Promise<AuthPayload> {
    const user = await UserRepo.registerUser(credentials);
    if (!user) throw new BadRequestError("Registration failed");

    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwtSecret
    );

    return { token, user };
  }
}
