import { Request, Response, Router } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { MessageService } from "../services/message.service";
import { asyncHandler } from "../utils/async-wrapper";
import { SignedRequest } from "../types/types";

export default function messageRoutes(messageService: MessageService): Router {
  const messageRoutes = Router();

  messageRoutes.delete(
    "/:messageId",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      await messageService.deleteMessage(req.params.messageId);
      res.status(204).send();
    })
  );

  messageRoutes.patch(
    "/:messageId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      await messageService.editMessage(req.params.messageId, req.body);
      res.status(204).send();
    })
  );

  return messageRoutes;
}
