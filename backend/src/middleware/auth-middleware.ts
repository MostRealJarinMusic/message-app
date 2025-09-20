import jwt from "jsonwebtoken";
import { config } from "../config";
import { SignedRequest } from "../types/types";
import { UserSignature } from "../../../common/types";

export function authMiddleware(req: SignedRequest, res: any, next: any) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    req.signature = jwt.verify(token, config.accessJwtSecret) as UserSignature;
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}
