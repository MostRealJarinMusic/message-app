import {
  Channel,
  ChannelCreate,
  ChannelType,
  ChannelUpdate,
  WSEventType,
} from "../../../common/types";
import { ulid } from "ulid";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../errors/errors";
import { ChannelRepo } from "../db/repos/channel.repo";
import { ServerMemberRepo } from "../db/repos/server-member.repo";
import { EventBusPort } from "../types/types";

export class ChannelService {
  constructor(
    private readonly channelRepo: ChannelRepo,
    private readonly serverMemberRepo: ServerMemberRepo,
    private readonly eventBus: EventBusPort
  ) {}

  //Creating channel in server
  async createChannel(serverId: string, channelCreate: ChannelCreate) {
    if (!channelCreate) throw new BadRequestError("Channel data required");

    const channel: Channel = {
      name: channelCreate.name,
      type: ChannelType.TEXT,
      categoryId: channelCreate.categoryId,
      serverId: serverId,
      id: ulid(),
    };

    await this.channelRepo.createChannel(channel);

    const memberIds = await this.serverMemberRepo.getServerMemberIds(serverId);
    this.eventBus.publish(WSEventType.CHANNEL_CREATE, channel, memberIds);

    return channel;
  }

  //Accessing server channels
  async getChannels(serverId: string) {
    //Check if server exists?
    const channels = await this.channelRepo.getChannelsByServer(serverId);
    return channels;
  }

  async deleteChannel(channelId: string) {
    const channel = await this.channelRepo.getChannel(channelId);
    if (!channel) throw new NotFoundError("Channel doesn't exist");

    if (channel.type === ChannelType.DM || !channel.serverId)
      throw new ForbiddenError("Attempted to delete DM channel");

    const memberIds = await this.serverMemberRepo.getServerMemberIds(
      channel.serverId
    );
    await this.channelRepo.deleteChannel(channelId);

    this.eventBus.publish(WSEventType.CHANNEL_DELETE, channel, memberIds);
  }

  async editChannel(channelId: string, channelUpdate: ChannelUpdate) {
    const channel = await this.channelRepo.getChannel(channelId);
    if (!channel) throw new NotFoundError("Channel not found");

    if (channel.type === ChannelType.DM || !channel.serverId)
      throw new ForbiddenError("Attempted to edit DM channel");

    const proposedChannel = { ...channel, ...channelUpdate };
    console.log(proposedChannel);
    await this.channelRepo.editChannel(proposedChannel);
    const updatedChannel = await this.channelRepo.getChannel(channelId);

    console.log(updatedChannel);

    const memberIds = await this.serverMemberRepo.getServerMemberIds(
      channel.serverId
    );

    //Broadcast to users
    this.eventBus.publish(
      WSEventType.CHANNEL_UPDATE,
      updatedChannel,
      memberIds
    );
  }
}
