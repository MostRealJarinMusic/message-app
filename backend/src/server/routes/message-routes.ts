import { Request, Response, Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { WebSocketManager } from "../ws/websocket-manager";
import { MessageHandler } from "./handlers/message-handler";
import { asyncHandler } from "../../utils/async-wrapper";
import { SignedRequest } from "../../types/types";

export default function messageRoutes(wsManager: WebSocketManager): Router {
  const messageRoutes = Router();

  messageRoutes.delete(
    "/:messageId",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      await MessageHandler.deleteMessage(req.params.messageId, wsManager);
      res.status(204).send();
    })
  );

  messageRoutes.patch(
    "/:messageId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      await MessageHandler.editMessage(
        req.params.messageId,
        req.body.content,
        wsManager
      );
      res.status(204).send();
    })
  );

  return messageRoutes;
}
