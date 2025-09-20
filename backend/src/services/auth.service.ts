import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config";
import {
  AuthPayload,
  LoginCredentials,
  RegisterPayload,
  UserSignature,
} from "../../../common/types";
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from "../errors/errors";
import { UserRepo } from "../db/repos/user.repo";

export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = "15m";
  private readonly REFRESN_TOKEN_EXPIRY = "1h";

  constructor(private readonly userRepo: UserRepo) {}

  async login(credentials: LoginCredentials): Promise<AuthPayload> {
    const user = await this.userRepo.loginUser(credentials);
    if (!user) throw new UnauthorizedError("Invalid credentials");

    return this.generateTokens({ id: user.id, username: user.username }); //{ token };
  }

  async register(credentials: RegisterPayload): Promise<AuthPayload> {
    const user = await this.userRepo.registerUser(credentials);
    if (!user) throw new BadRequestError("Registration failed");

    return this.generateTokens({ id: user.id, username: user.username });
  }

  async logout() {
    console.log("Attempt to logout");
  }

  refresh() {}

  verifyToken(token: string): UserSignature {
    try {
      const signature = jwt.verify(
        token,
        config.accessJwtSecret
      ) as UserSignature;
      return signature;
    } catch {
      throw new ForbiddenError("Bad token");
    }
  }

  private generateToken(
    signature: UserSignature,
    secret: string,
    options: SignOptions
  ) {
    return jwt.sign(signature, secret, options);
  }

  private generateTokens(signature: UserSignature) {
    const token = this.generateToken(signature, config.accessJwtSecret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = this.generateToken(
      signature,
      config.refreshJwtSecret,
      {
        expiresIn: this.REFRESN_TOKEN_EXPIRY,
      }
    );

    return { token, refreshToken };
  }
}
