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
    "/:inviteId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const invite = await InviteService.previewInvite(req.params.inviteId);
      res.json(invite);
    })
  );

  inviteRoutes.post(
    "/:inviteId/accept",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const server = InviteService.acceptInvite(
        req.params.inviteId,
        req.signature!.id,
        wsManager
      );
      res.json(server);
    })
  );

  inviteRoutes.delete(
    "/:inviteId",
    asyncHandler(async (req: Request, res: Response) => {
      await InviteService.revokeInvite(req.params.inviteId);
      res.status(204).send();
    })
  );

  return inviteRoutes;
}
