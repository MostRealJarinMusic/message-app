import { Response } from "express";
import { SignedRequest } from "../../../types/types";
import { DMChannelRepo } from "../../../db/repos/dm-channel.repo";

export class DirectMessageHandler {
  static async getChannels(req: SignedRequest, res: Response) {
    try {
      const userId = req.signature.id;
      const dmChannels = await DMChannelRepo.getDMChannels(userId);

      res.json(dmChannels);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch DM channels" });
    }
  }
}
