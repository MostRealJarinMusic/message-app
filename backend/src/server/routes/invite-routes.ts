import { Request, Response, Router } from "express";
import { WebSocketManager } from "../ws/websocket-manager";
import { authMiddleware } from "../..//middleware/auth-middleware";
import { InviteHandler } from "./handlers/invite-handler";
import { SignedRequest } from "../../types/types";

export default function inviteRoutes(wsManager: WebSocketManager): Router {
  const inviteRoutes = Router();

  inviteRoutes.post("", authMiddleware, async (req: Request, res: Response) => {
    InviteHandler.createInvite(req as SignedRequest, res);
  });

  inviteRoutes.get(
    "/:inviteId",
    authMiddleware,
    async (req: Request, res: Response) => {
      InviteHandler.previewInvite(req as SignedRequest, res);
    }
  );

  inviteRoutes.post(
    "/:inviteId/accept",
    authMiddleware,
    async (req: Request, res: Response) => {
      InviteHandler.acceptInvite(req as SignedRequest, res, wsManager);
    }
  );

  inviteRoutes.delete("/:inviteId", async (req: Request, res: Response) => {
    InviteHandler.revokeInvite(req as SignedRequest, res);
  });

  return inviteRoutes;
}
