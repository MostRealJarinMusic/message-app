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

export class ChannelHandler {
  static async deleteChannel(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const channelId = req.params.channelId;
      const channel = await ChannelRepo.getChannel(channelId);

      if (!channel) {
        res.status(404).json({ error: "Channel doesn't exist" });
        return;
      }

      if (channel.type === ChannelType.DM || !channel.serverId) {
        res.status(403).json({ error: "Attemtped to delete DM channel" });
        return;
      }

      const memberIds = await ServerMemberRepo.getServerMemberIds(
        channel.serverId
      );
      await ChannelRepo.deleteChannel(channelId);

      wsManager.broadcastToGroup(
        WSEventType.CHANNEL_DELETE,
        channel,
        memberIds
      );

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete channel" });
    }
  }

  static async sendMessage(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const channelId = req.params.channelId;
      const authorId = req.signature.id;
      const content = req.body.content;

      const channel = await ChannelRepo.getChannel(channelId);

      if (!channel) {
        res.status(404).json({ error: "Channel not found" });
        return;
      }

      if (!content) {
        res.status(400).json({ error: "Message content required" });
        return;
      }

      const message: Message = {
        id: ulid(),
        channelId,
        authorId,
        content,
        createdAt: new Date().toISOString(),
      };

      await MessageRepo.createMessage(message);

      //Target IDs for the channel
      let targetIds: string[] = [];

      if (channel.type === ChannelType.TEXT && channel.serverId) {
        //we are on a server - assume that all channels are public
        targetIds = await ServerMemberRepo.getServerMemberIds(channel.serverId);
      } else if (channel.type === ChannelType.DM) {
        //We are on a DM
        targetIds = await DMChannelRepo.getDMChannelParticipantIds(channel.id);
      }

      wsManager.broadcastToGroup(WSEventType.RECEIVE, message, targetIds);

      res.status(201).json(message);
    } catch (err) {
      res.status(500).json({ error: "Failed to send message" });
    }
  }

  static async getMessages(req: Request, res: Response) {
    try {
      const messages = await MessageRepo.getAllChannelMessages(
        req.params.channelId
      );
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch channel messages" });
    }
  }

  static async editChannel(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const channelId = req.params.channelId;
      const channelUpdate = req.body.channelUpdate as ChannelUpdate;
      const channel = await ChannelRepo.getChannel(channelId);

      if (!channel) {
        res.status(404).json({ error: "Channel doesn't exist" });
        return;
      }

      if (channel.type === ChannelType.DM || !channel.serverId) {
        res.status(403).json({ error: "Attemtped to edit DM channel" });
        return;
      }

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
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to edit channel" });
    }
  }
}
