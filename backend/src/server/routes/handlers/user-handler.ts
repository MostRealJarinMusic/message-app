import { Request, Response } from "express-serve-static-core";
import { UserRepo } from "../../../db/repos/user.repo";
import { SignedRequest } from "../../../types/types";
import { DMChannelRepo } from "../../../db/repos/dm-channel.repo";
import { WebSocketManager } from "src/server/ws/websocket-manager";

export class UserHandler {
  static async getMe(req: SignedRequest, res: Response) {
    try {
      const userId = req.signature.id;
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
      const userId = req.signature.id;
      const dmChannels = await DMChannelRepo.getDMChannels(userId);

      res.json(dmChannels);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch DM channels" });
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

  static async getAllUserPresences(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const users = await UserRepo.getAllUsers();
      const userIds = users.map((u) => u.id);

      const presences = wsManager.getPresenceSnapshot(userIds);

      res.json(presences);
    } catch (err) {
      res.status(500).json({ error: "Failed to load presences" });
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
