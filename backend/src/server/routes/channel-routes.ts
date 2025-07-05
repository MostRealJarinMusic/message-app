import { Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { MessageRepo } from "../..//db/repos/message.repo";
import { Message, WSEventType } from "../../../../common/types";
import { ulid } from "ulid";
import { WebSocketManager } from "../ws/websocket-manager";

export default function channelRoutes(wsManager: WebSocketManager): Router {
  const channelRoutes = Router();

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

        await MessageRepo.insertMessage(message);

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
