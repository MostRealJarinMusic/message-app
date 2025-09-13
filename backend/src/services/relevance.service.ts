import { ChannelType } from "../../../common/types";
import { ChannelRepo } from "../db/repos/channel.repo";
import { DMChannelRepo } from "../db/repos/dm-channel.repo";
import { ServerMemberRepo } from "../db/repos/server-member.repo";
import { NotFoundError } from "../errors/errors";
import { FriendService } from "./friend.service";
import { ServerService } from "./server.service";

export class RelevanceService {
  constructor(
    private readonly friendService: FriendService,
    private readonly serverService: ServerService,
    private readonly channelRepo: ChannelRepo,
    private readonly serverMemberRepo: ServerMemberRepo,
    private readonly dmChannelRepo: DMChannelRepo
  ) {}

  async getRelevantUserIds(userId: string) {
    const friendIds = await this.friendService.getFriendIds(userId);
    const sharedServerUserIds = await this.serverService.getSharedServerUserIds(
      userId
    );

    return Array.from(new Set([...friendIds, ...sharedServerUserIds]));
  }

  async getTargetIdsForChannel(channelId: string): Promise<string[]> {
    const channel = await this.channelRepo.getChannel(channelId);
    if (!channel) throw new NotFoundError("Channel doesn't exist");

    if (channel.type === ChannelType.TEXT && channel.serverId) {
      return this.serverMemberRepo.getServerMemberIds(channel.serverId);
    } else if (channel.type === ChannelType.DM) {
      return this.dmChannelRepo.getDMChannelParticipantIds(channel.id);
    }

    return [];
  }
}
