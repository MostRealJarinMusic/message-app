import { Request, Response } from "express-serve-static-core";
import { UserRepo } from "../../../db/repos/user.repo";
import { SignedRequest } from "../../../types/types";

export class UserHandler {
  static async getMe(req: SignedRequest, res: Response) {
    try {
      const userId = req.signature!.id;
      const user = await UserRepo.getUserById(userId);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  }

  static async getDMChannels(req: SignedRequest, res: Response) {
    try {
      const userId = req.signature!.id;
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserRepo.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await UserRepo.getUserById(req.params.id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  }
}
