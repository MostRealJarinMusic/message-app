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
      FriendRequestHandler.getIncomingFriendRequests(req as SignedRequest, res);
    }
  );

  friendRequestRoutes.get(
    "/outgoing",
    authMiddleware,
    async (req: Request, res: Response) => {
      FriendRequestHandler.getOutgoingFriendRequests(req as SignedRequest, res);
    }
  );

  friendRequestRoutes.patch(
    "/:requestId",
    authMiddleware,
    async (req: Request, res: Response) => {
      FriendRequestHandler.updateFriendRequest(
        req as SignedRequest,
        res,
        wsManager
      );
    }
  );

  friendRequestRoutes.delete(
    "/:requestId",
    authMiddleware,
    async (req: Request, res: Response) => {
      FriendRequestHandler.deleteFriendRequest(
        req as SignedRequest,
        res,
        wsManager
      );
    }
  );

  return friendRequestRoutes;
}
