import { Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { MessageRepo } from "../..//db/repos/message.repo";

const channelRoutes = Router();

channelRoutes.get("/:channelId/messages", authMiddleware, async (req, res) => {
  const messages = await MessageRepo.getAllChannelMessages(
    req.params.channelId
  );
  res.json(messages);
});

export default channelRoutes;
