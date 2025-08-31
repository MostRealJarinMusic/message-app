import { DMChannelRepo } from "../../../db/repos/dm-channel.repo";
import { Channel } from "@common/types";

export class DirectMessageHandler {
  static async getChannels(userId: string): Promise<Channel[]> {
    const dmChannels = await DMChannelRepo.getDMChannels(userId);
    return dmChannels;
  }
}
