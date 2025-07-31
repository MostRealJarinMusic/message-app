//import { Request, Response } from "express-serve-static-core";
import { UserRepo } from "../db/repos/user.repo";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { Request, Response } from "express-serve-static-core";

export class AuthHandler {
  static async login(req: Request, res: Response) {
    const user = await UserRepo.loginUser(req.body);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwtSecret
    );
    res.json({ token, user });
  }

  static async register(req: Request, res: Response) {
    const user = await UserRepo.registerUser(req.body);
    if (!user) {
      res.status(400).json({ error: "Registration failed" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwtSecret
    );
    res.json({ token, user });
  }
}
