import jwt from "jsonwebtoken";
import { config } from "../config";

export function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    req.signature = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}
