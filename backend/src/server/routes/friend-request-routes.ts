import { Request, Response, Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { WebSocketManager } from "../ws/websocket-manager";
import { FriendRequestHandler } from "./handlers/friend-request-handler";
import { SignedRequest } from "../../types/types";
import { asyncHandler } from "../../utils/async-wrapper";

export default function friendRequestRoutes(
  wsManager: WebSocketManager
): Router {
  const friendRequestRoutes = Router();

  friendRequestRoutes.post(
    "",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const result = await FriendRequestHandler.sendFriendRequest(
        req.signature!.id,
        req.body,
        wsManager
      );
      res.status(201).json(result);
    })
  );

  friendRequestRoutes.get(
    "/incoming",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const result = await FriendRequestHandler.getIncomingFriendRequests(
        req.signature!.id
      );
      res.json(result);
    })
  );

  friendRequestRoutes.get(
    "/outgoing",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const result = await FriendRequestHandler.getOutgoingFriendRequests(
        req.signature!.id
      );
      res.json(result);
    })
  );

  friendRequestRoutes.patch(
    "/:requestId",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      await FriendRequestHandler.updateFriendRequest(
        req.signature!.id,
        req.body,
        wsManager
      );
      res.status(204).send();
    })
  );

  friendRequestRoutes.delete(
    "/:requestId",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      await FriendRequestHandler.deleteFriendRequest(
        req.signature!.id,
        req.params.requestId,
        wsManager
      );
      res.status(204).send();
    })
  );

  return friendRequestRoutes;
}
