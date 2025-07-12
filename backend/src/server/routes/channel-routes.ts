import { Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { MessageRepo } from "../../db/repos/message.repo";
import { Message, WSEventType } from "../../../../common/types";
import { ulid } from "ulid";
import { WebSocketManager } from "../ws/websocket-manager";
import { ChannelRepo } from "../../db/repos/channel.repo";

export default function channelRoutes(wsManager: WebSocketManager): Router {
  const channelRoutes = Router();

  channelRoutes.delete("/:channelId", authMiddleware, async (req, res) => {
    try {
      const channelId = req.params.channelId;
      const channel = await ChannelRepo.getChannel(channelId);

      if (channel) {
        await ChannelRepo.deleteChannel(channelId);
      } else {
        res.status(404).json({ error: "Channel doesn't exist" });
        return;
      }

      wsManager.broadcastToAll(WSEventType.CHANNEL_DELETE, channel);

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete channel" });
    }
  });

  channelRoutes.post(
    "/:channelId/messages",
    authMiddleware,
    async (req, res) => {
      try {
        const channelId = req.params.channelId;
        const authorId = (req as any).signature.id;
        const content = req.body.content;

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

        //Broadcast to users
        wsManager.broadcastToAll(WSEventType.RECEIVE, message);

        res.status(201).json(message);
      } catch (err) {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  );

  channelRoutes.get(
    "/:channelId/messages",
    authMiddleware,
    async (req, res) => {
      const messages = await MessageRepo.getAllChannelMessages(
        req.params.channelId
      );
      res.json(messages);
    }
  );

  return channelRoutes;
}
