import { MessageRepo } from "../../../db/repos/message.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import {
  Message,
  UserSignature,
  WSEventType,
} from "../../../../../common/types";
import { Request, Response } from "express";

export class MessageHandler {
  static async deleteMessage(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const messageId = req.params.messageId;
      const message = await MessageRepo.getMessage(messageId);

      if (message) {
        await MessageRepo.deleteMessage(messageId);
      } else {
        res.status(404).json({ error: "Message doesn't exist" });
        return;
      }

      //Broadcast to users
      wsManager.broadcastToAll(WSEventType.DELETED, message);

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
      const messageExists = await MessageRepo.messageExists(messageId);

      if (messageExists) {
        await MessageRepo.editMessage(messageId, newContent);
        const newMessage = await MessageRepo.getMessage(messageId);

        //Broadcast to users
        wsManager.broadcastToAll(WSEventType.EDITED, newMessage);
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Message doesn't exist" });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to edit message" });
    }
  }
}
