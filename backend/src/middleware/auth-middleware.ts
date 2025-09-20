import jwt, { TokenExpiredError } from "jsonwebtoken";
import { config } from "../config";
import { SignedRequest } from "../types/types";
import { UserSignature } from "../../../common/types";
import { NextFunction, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UnauthorizedError } from "../errors/errors";

export function authMiddleware(authService: AuthService) {
  return (req: SignedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new UnauthorizedError("No token provided"); //return res.status(401).json({ error: "No token provided" });

    req.signature = authService.verifyToken(token);
    next();
  };
}
