import { MessageRepo } from "../../../db/repos/message.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import { ChannelType, WSEventType } from "../../../../../common/types";
import { ChannelRepo } from "../../../db/repos/channel.repo";
import { ServerMemberRepo } from "../../../db/repos/server-member.repo";
import { DMChannelRepo } from "../../../db/repos/dm-channel.repo";
import { NotFoundError } from "../../../errors/errors";

export class MessageHandler {
  static async deleteMessage(messageId: string, wsManager: WebSocketManager) {
    const message = await MessageRepo.getMessage(messageId);
    if (!message) throw new NotFoundError("Message doesn't exist");

    const channel = await ChannelRepo.getChannel(message.channelId);

    //Target IDs for the channel
    let targetIds: string[] = [];

    if (channel.type === ChannelType.TEXT && channel.serverId) {
      //we are on a server - assume that all channels are public
      targetIds = await ServerMemberRepo.getServerMemberIds(channel.serverId);
    } else if (channel.type === ChannelType.DM) {
      //We are on a DM
      targetIds = await DMChannelRepo.getDMChannelParticipantIds(channel.id);
    }

    await MessageRepo.deleteMessage(messageId);

    //Broadcast to users
    wsManager.broadcastToGroup(WSEventType.DELETED, message, targetIds);
  }

  static async editMessage(
    messageId: string,
    newContent: string,
    wsManager: WebSocketManager
  ) {
    const message = await MessageRepo.getMessage(messageId);

    if (!message) throw new NotFoundError("Message doesn't exist");

    await MessageRepo.editMessage(messageId, newContent);
    const newMessage = await MessageRepo.getMessage(messageId);

    const channel = await ChannelRepo.getChannel(message.channelId);

    //Target IDs for the channel
    let targetIds: string[] = [];

    if (channel.type === ChannelType.TEXT && channel.serverId) {
      //we are on a server - assume that all channels are public
      targetIds = await ServerMemberRepo.getServerMemberIds(channel.serverId);
    } else if (channel.type === ChannelType.DM) {
      //We are on a DM
      targetIds = await DMChannelRepo.getDMChannelParticipantIds(channel.id);
    }

    //Broadcast to users
    wsManager.broadcastToGroup(WSEventType.EDITED, newMessage, targetIds);
  }
}
