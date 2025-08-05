import { Request, Response, Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { WebSocketManager } from "../ws/websocket-manager";
import { FriendRequestHandler } from "./handlers/friend-request-handler";
import { SignedRequest } from "../../types/types";

export default function friendRequestRoutes(
  wsManager: WebSocketManager
): Router {
  const friendRequestRoutes = Router();

  friendRequestRoutes.post(
    "",
    authMiddleware,
    async (req: Request, res: Response) => {
      FriendRequestHandler.sendFriendRequest(
        req as SignedRequest,
        res,
        wsManager
      );
    }
  );

  friendRequestRoutes.get(
    "/incoming",
    authMiddleware,
    async (req: Request, res: Response) => {
      FriendRequestHandler.getIncomingRequests(req as SignedRequest, res);
    }
  );

  friendRequestRoutes.get(
    "/outgoing",
    authMiddleware,
    async (req: Request, res: Response) => {
      FriendRequestHandler.getOutgoingRequests(req as SignedRequest, res);
    }
  );

  friendRequestRoutes.post(
    "/:senderId/accept",
    authMiddleware,
    async (req: Request, res: Response) => {
      FriendRequestHandler.acceptRequest(req as SignedRequest, res, wsManager);
    }
  );

  friendRequestRoutes.post(
    "/:senderId/reject",
    authMiddleware,
    async (req: Request, res: Response) => {
      FriendRequestHandler.rejectRequest(req as SignedRequest, res, wsManager);
    }
  );

  friendRequestRoutes.post(
    "/:receiverId/cancel",
    authMiddleware,
    async (req: Request, res: Response) => {
      FriendRequestHandler.cancelRequest(req as SignedRequest, res, wsManager);
    }
  );

  return friendRequestRoutes;
}
