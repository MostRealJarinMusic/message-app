import jwt from "jsonwebtoken";
import { config } from "../config";
import {
  AuthPayload,
  LoginCredentials,
  RegisterPayload,
  UserSignature,
} from "../../../common/types";
import { BadRequestError, UnauthorizedError } from "../errors/errors";
import { UserRepo } from "../db/repos/user.repo";

export class AuthService {
  constructor(private readonly userRepo: UserRepo) {}

  async login(credentials: LoginCredentials): Promise<AuthPayload> {
    const user = await this.userRepo.loginUser(credentials);
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwtSecret
    );

    return { token, user };
  }

  async register(credentials: RegisterPayload): Promise<AuthPayload> {
    const user = await this.userRepo.registerUser(credentials);
    if (!user) throw new BadRequestError("Registration failed");

    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwtSecret
    );

    return { token, user };
  }

  verifyToken(token: string): UserSignature {
    try {
      return jwt.verify(token, config.jwtSecret) as UserSignature;
    } catch {
      throw new Error("Bad token");
    }
  }
}
