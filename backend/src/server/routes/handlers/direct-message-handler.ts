import { DMChannelRepo } from "../../../db/repos/dm-channel.repo";
import { Channel } from "@common/types";

export class DirectMessageHandler {
  static async getChannels(userId: string): Promise<Channel[]> {
    try {
      return await DMChannelRepo.getDMChannels(userId);
    } catch (err) {
      throw new Error("Failed to load DM channels");
    }
  }
}
