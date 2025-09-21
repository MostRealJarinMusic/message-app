import jwt, { SignOptions, TokenExpiredError } from "jsonwebtoken";
import { config } from "../config";
import {
  AuthPayload,
  LoginCredentials,
  RegisterPayload,
  Token,
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
  private readonly REFRESH_TOKEN_EXPIRY = "1h";

  constructor(private readonly userRepo: UserRepo) {}

  async login(
    credentials: LoginCredentials
  ): Promise<AuthPayload & { refreshToken: Token }> {
    const user = await this.userRepo.loginUser(credentials);
    if (!user) throw new UnauthorizedError("Invalid credentials");

    return this.generateTokens({ id: user.id, username: user.username }); //{ token };
  }

  async register(
    credentials: RegisterPayload
  ): Promise<AuthPayload & { refreshToken: Token }> {
    const user = await this.userRepo.registerUser(credentials);
    if (!user) throw new BadRequestError("Registration failed");

    return this.generateTokens({ id: user.id, username: user.username });
  }

  async logout() {
    console.log("Attempt to logout");
  }

  refresh(refreshToken: Token): Token {
    try {
      const signature = this.verify(refreshToken, config.refreshJwtSecret);

      return this.generateToken(
        { id: signature.id, username: signature.username },
        config.accessJwtSecret,
        {
          expiresIn: this.ACCESS_TOKEN_EXPIRY,
        }
      );
    } catch (err) {
      if (err instanceof TokenExpiredError)
        throw new UnauthorizedError("Expired refresh token"); //Attempt to log user out

      throw new ForbiddenError(`Bad refresh token -> ${err}`);
    }
  }

  verifyToken(token: string): UserSignature {
    try {
      const signature = this.verify(token, config.accessJwtSecret);
      return signature;
    } catch (err) {
      if (err instanceof TokenExpiredError)
        throw new UnauthorizedError("Expired token");

      throw new ForbiddenError("Bad token");
    }
  }

  private verify(token: string, secret: string) {
    return jwt.verify(token, secret) as UserSignature;
  }

  private generateToken(
    signature: UserSignature,
    secret: string,
    options: SignOptions
  ) {
    return jwt.sign(signature, secret, options) as Token;
  }

  private generateTokens(
    signature: UserSignature
  ): AuthPayload & { refreshToken: Token } {
    const token = this.generateToken(signature, config.accessJwtSecret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = this.generateToken(
      signature,
      config.refreshJwtSecret,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
      }
    );

    return { token, refreshToken };
  }
}
