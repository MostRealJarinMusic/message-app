import { Router } from "express";
import { authMiddleware } from "src/middleware/auth-middleware";
import { MessageRepo } from "src/db/repos/message.repo";

const messageRoutes = Router();

// messageRoutes.get("/:channelId/messages", authMiddleware, async (req, res) => {
//   const messages = await MessageRepo.getAllChannelMessages(
//     req.params.channelId
//   );
//   res.json(messages);
// });

export default messageRoutes;
