import jwt, { TokenExpiredError } from "jsonwebtoken";
import { config } from "../config";
import { SignedRequest } from "../types/types";
import { UserSignature } from "../../../common/types";
import { NextFunction, Response } from "express";
import { AuthService } from "../services/auth.service";

export function authMiddleware(authService: AuthService) {
  return (req: SignedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
      req.signature = authService.verifyToken(token);
      next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        res.status(401).json({ error: "Token has expired" });
        return;
      }
      res.status(403).json({ error: "Invalid token" });
    }
  };
}
