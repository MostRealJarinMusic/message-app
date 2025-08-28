import { MessageRepo } from "../../../db/repos/message.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import {
  ChannelType,
  Message,
  UserSignature,
  WSEventType,
} from "../../../../../common/types";
import { Request, Response } from "express";
import { ChannelRepo } from "../../../db/repos/channel.repo";
import { ServerMemberRepo } from "../../../db/repos/server-member.repo";
import { DMChannelRepo } from "../../../db/repos/dm-channel.repo";

export class MessageHandler {
  static async deleteMessage(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const messageId = req.params.messageId;
      const message = await MessageRepo.getMessage(messageId);

      if (!message) {
        res.status(404).json({ error: "Message doesn't exist" });
        return;
      }

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

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete message" });
    }
  }

  static async editMessage(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const messageId = req.params.messageId;
      const newContent = req.body.content as string;
      const message = await MessageRepo.getMessage(messageId);

      if (!message) {
        res.status(404).json({ error: "Message doesn't exist" });
        return;
      }

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
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to edit message" });
    }
  }
}
