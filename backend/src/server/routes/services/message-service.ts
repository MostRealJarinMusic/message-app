import { MessageRepo } from "../../../db/repos/message.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import {
  ChannelType,
  Message,
  MessageCreate,
  MessageUpdate,
  WSEventType,
} from "../../../../../common/types";
import { ChannelRepo } from "../../../db/repos/channel.repo";
import { ServerMemberRepo } from "../../../db/repos/server-member.repo";
import { DMChannelRepo } from "../../../db/repos/dm-channel.repo";
import { BadRequestError, NotFoundError } from "../../../errors/errors";
import { ulid } from "ulid";

export class MessageService {
  static async sendMessage(
    channelId: string,
    authorId: string,
    messageCreate: MessageCreate,
    wsManager: WebSocketManager
  ) {
    const channel = await ChannelRepo.getChannel(channelId);

    if (!channel) throw new NotFoundError("Channel doesn't exist");

    if (!messageCreate) throw new BadRequestError("Message content required");

    const message: Message = {
      id: ulid(),
      channelId,
      authorId,
      content: messageCreate.content,
      createdAt: new Date().toISOString(),
    };

    await MessageRepo.createMessage(message);

    //Target IDs for the channel
    let targetIds: string[] = await this.getTargetIdsForChannel(channelId);

    wsManager.broadcastToGroup(WSEventType.MESSAGE_RECEIVE, message, targetIds);

    return message;
  }

  static async getMessages(channelId: string) {
    const channel = await ChannelRepo.getChannel(channelId);
    if (!channel) throw new NotFoundError("Channel doesn't exist");

    return await MessageRepo.getMessagesByChannel(channelId);
  }

  static async deleteMessage(messageId: string, wsManager: WebSocketManager) {
    const message = await MessageRepo.getMessage(messageId);
    if (!message) throw new NotFoundError("Message doesn't exist");

    //Target IDs for the channel
    let targetIds: string[] = await this.getTargetIdsForChannel(
      message.channelId
    );

    await MessageRepo.deleteMessage(messageId);

    //Broadcast to users
    wsManager.broadcastToGroup(WSEventType.MESSAGE_DELETE, message, targetIds);
  }

  static async editMessage(
    messageId: string,
    messageUpdate: MessageUpdate,
    wsManager: WebSocketManager
  ) {
    const message = await MessageRepo.getMessage(messageId);

    if (!message) throw new NotFoundError("Message doesn't exist");

    await MessageRepo.editMessage(messageId, messageUpdate.content);
    const newMessage = await MessageRepo.getMessage(messageId);

    //Target IDs for the channel
    let targetIds: string[] = await this.getTargetIdsForChannel(
      message.channelId
    );

    //Broadcast to users
    wsManager.broadcastToGroup(WSEventType.MESSAGE_EDIT, newMessage, targetIds);
  }

  private static async getTargetIdsForChannel(
    channelId: string
  ): Promise<string[]> {
    const channel = await ChannelRepo.getChannel(channelId);
    if (!channel) throw new NotFoundError("Channel doesn't exist");

    if (channel.type === ChannelType.TEXT && channel.serverId) {
      return ServerMemberRepo.getServerMemberIds(channel.serverId);
    } else if (channel.type === ChannelType.DM) {
      return DMChannelRepo.getDMChannelParticipantIds(channel.id);
    }

    return [];
  }
}
