import { Request, Response } from "express-serve-static-core";
import { UserRepo } from "../db/repos/user.repo";
import jwt from "jsonwebtoken";
import { config } from "../config";

export class AuthService {
  async login(req: any, res: any) {
    const user = await UserRepo.loginUser(req.body);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwtSecret
    );
    res.json({ token, user });
  }

  async register(req: any, res: any) {
    const user = await UserRepo.registerUser(req.body);
    if (!user) return res.status(400).json({ error: "Registration failed" });
    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwtSecret
    );
    res.json({ token, user });
  }
}
