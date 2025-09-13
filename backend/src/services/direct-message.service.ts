import { DMChannelRepo } from "../db/repos/dm-channel.repo";
import { Channel } from "@common/types";

export class DirectMessageService {
  constructor(private readonly dmChannelRepo: DMChannelRepo) {}

  async getChannels(userId: string): Promise<Channel[]> {
    try {
      return await this.dmChannelRepo.getDMChannels(userId);
    } catch (err) {
      throw new Error("Failed to load DM channels");
    }
  }
}
