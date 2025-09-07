import { Request, Response, Router } from "express";
import { WebSocketManager } from "../ws/websocket-manager";
import { authMiddleware } from "../..//middleware/auth-middleware";
import { InviteService } from "./services/invite-service";
import { SignedRequest } from "../../types/types";
import { asyncHandler } from "../../utils/async-wrapper";

export default function inviteRoutes(wsManager: WebSocketManager): Router {
  const inviteRoutes = Router();

  inviteRoutes.post(
    "",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const invite = await InviteService.createInvite(req.body);
      res.status(201).json(invite);
    })
  );

  inviteRoutes.get(
    "/:link",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const invite = await InviteService.previewInvite(req.params.link);
      res.json(invite);
    })
  );

  inviteRoutes.post(
    "/:link/accept",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const server = await InviteService.acceptInvite(
        req.params.link,
        req.signature!.id,
        wsManager
      );
      res.json(server);
    })
  );

  inviteRoutes.delete(
    "/:link",
    asyncHandler(async (req: Request, res: Response) => {
      await InviteService.revokeInvite(req.params.link);
      res.status(204).send();
    })
  );

  return inviteRoutes;
}
