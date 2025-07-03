import { Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { MessageRepo } from "../../db/repos/message.repo";
import { WebSocketManager } from "../ws/websocket-manager";
import { Message, UserSignature, WSEventType } from "../../../../common/types";

// const messageRoutes = Router();

// // messageRoutes.get("/:channelId/messages", authMiddleware, async (req, res) => {
// //   const messages = await MessageRepo.getAllChannelMessages(
// //     req.params.channelId
// //   );
// //   res.json(messages);
// // });

// messageRoutes.delete("/:messageId", authMiddleware, async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     await MessageRepo.deleteMessage(messageId);

//     res.status(204);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to delete message" });
//   }
// });

// export default messageRoutes;

export default function messageRoutes(wsManager: WebSocketManager): Router {
  const messageRoutes = Router();

  messageRoutes.delete("/:messageId", authMiddleware, async (req, res) => {
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
      wsManager.broadcast(WSEventType.DELETED, message);

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  messageRoutes.patch("/:messageId", authMiddleware, async (req, res) => {
    try {
      const messageId = req.params.messageId;
      const newContent = req.body.content as string;
      const oldMessage = await MessageRepo.getMessage(messageId);

      if (oldMessage) {
        await MessageRepo.editMessage(messageId, newContent);
        const newMessage = await MessageRepo.getMessage(messageId);
        //Broadcast to users
        wsManager.broadcast(WSEventType.EDITED, newMessage);
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Message doesn't exist" });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to edit message" });
    }
  });

  return messageRoutes;
}
