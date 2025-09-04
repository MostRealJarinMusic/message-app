import { Request, Response, Router } from "express";
import { MessageRepo } from "../../../db/repos/message.repo";
import {
  Channel,
  ChannelType,
  ChannelUpdate,
  Message,
  WSEventType,
} from "../../../../../common/types";
import { ulid } from "ulid";
import { WebSocketManager } from "../../ws/websocket-manager";
import { ChannelRepo } from "../../../db/repos/channel.repo";
import { SignedRequest } from "../../../types/types";
import { ServerMemberRepo } from "../../../db/repos/server-member.repo";
import { DMChannelRepo } from "../../../db/repos/dm-channel.repo";
import { ForbiddenError, NotFoundError } from "../../../errors/errors";

export class ChannelHandler {
  static async deleteChannel(channelId: string, wsManager: WebSocketManager) {
    const channel = await ChannelRepo.getChannel(channelId);
    if (!channel) throw new NotFoundError("Channel doesn't exist");

    if (channel.type === ChannelType.DM || !channel.serverId)
      throw new ForbiddenError("Attempted to delete DM channel");

    const memberIds = await ServerMemberRepo.getServerMemberIds(
      channel.serverId
    );
    await ChannelRepo.deleteChannel(channelId);

    wsManager.broadcastToGroup(WSEventType.CHANNEL_DELETE, channel, memberIds);
  }

  static async editChannel(
    channelId: string,
    channelUpdate: ChannelUpdate,
    wsManager: WebSocketManager
  ) {
    const channel = await ChannelRepo.getChannel(channelId);
    if (!channel) throw new NotFoundError("Channel not found");

    if (channel.type === ChannelType.DM || !channel.serverId)
      throw new ForbiddenError("Attempted to edit DM channel");

    const proposedChannel = { ...channel, ...channelUpdate } as Channel;
    await ChannelRepo.editChannel(proposedChannel);
    const updatedChannel = await ChannelRepo.getChannel(channelId);

    const memberIds = await ServerMemberRepo.getServerMemberIds(
      channel.serverId
    );

    //Broadcast to users
    wsManager.broadcastToGroup(
      WSEventType.CHANNEL_UPDATE,
      updatedChannel,
      memberIds
    );
  }
}
