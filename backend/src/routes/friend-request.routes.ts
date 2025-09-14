import { Response, Router } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { FriendRequestService } from "../services/friend-request.service";
import { SignedRequest } from "../types/types";
import { asyncHandler } from "../utils/async-wrapper";

export default function friendRequestRoutes(
  friendRequestService: FriendRequestService
): Router {
  const friendRequestRoutes = Router();

  friendRequestRoutes.post(
    "",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const result = await friendRequestService.sendFriendRequest(
        req.signature!.id,
        req.body
      );
      res.status(201).json(result);
    })
  );

  friendRequestRoutes.get(
    "/incoming",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const result = await friendRequestService.getIncomingFriendRequests(
        req.signature!.id
      );
      res.json(result);
    })
  );

  friendRequestRoutes.get(
    "/outgoing",
    authMiddleware,
    asyncHandler(async (req, res) => {
      const result = await friendRequestService.getOutgoingFriendRequests(
        req.signature!.id
      );
      res.json(result);
    })
  );

  friendRequestRoutes.patch(
    "/:requestId",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      await friendRequestService.updateFriendRequest(
        req.signature!.id,
        req.body
      );
      res.status(204).send();
    })
  );

  friendRequestRoutes.delete(
    "/:requestId",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      await friendRequestService.deleteFriendRequest(
        req.signature!.id,
        req.params.requestId
      );
      res.status(204).send();
    })
  );

  return friendRequestRoutes;
}
