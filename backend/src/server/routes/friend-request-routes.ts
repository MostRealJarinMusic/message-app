import { Request, Response, Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { WebSocketManager } from "../ws/websocket-manager";
import { FriendRequestService } from "./services/friend-request-service";
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
      const result = await FriendRequestService.sendFriendRequest(
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
      const result = await FriendRequestService.getIncomingFriendRequests(
        req.signature!.id
      );
      res.json(result);
    })
  );

  friendRequestRoutes.get(
    "/outgoing",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const result = await FriendRequestService.getOutgoingFriendRequests(
        req.signature!.id
      );
      res.json(result);
    })
  );

  friendRequestRoutes.patch(
    "/:requestId",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      await FriendRequestService.updateFriendRequest(
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
      await FriendRequestService.deleteFriendRequest(
        req.signature!.id,
        req.params.requestId,
        wsManager
      );
      res.status(204).send();
    })
  );

  return friendRequestRoutes;
}
