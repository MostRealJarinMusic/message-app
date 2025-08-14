import { FriendRepo } from "../../../db/repos/friend.repo";
import { Response } from "express";
import { SignedRequest } from "../../../types/types";

export class FriendHandler {
  static async getFriends(req: SignedRequest, res: Response) {
    try {
      const userId = req.signature.id;

      const allFriendIds = await FriendRepo.getFriends(userId);

      res.json(allFriendIds);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch friends" });
    }
  }

  static async blockFriend(req: SignedRequest, res: Response) {}

  static async removeFriend(req: SignedRequest, res: Response) {}
}
