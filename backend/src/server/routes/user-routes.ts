import { Router } from "express";
import { Request, Response } from "express-serve-static-core";
import { authMiddleware } from "../../middleware/auth-middleware";
import { UserService } from "./services/user-service";
import { SignedRequest } from "../../types/types";
import { DirectMessageService } from "./services/direct-message-service";
import { FriendService } from "./services/friend-service";
import { WebSocketManager } from "../ws/websocket-manager";
import { asyncHandler } from "../../utils/async-wrapper";

export default function userRoutes(wsManager: WebSocketManager): Router {
  const userRoutes = Router();

  userRoutes.get(
    "/me/dms",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const userId = req.signature!.id;
      const dmChannels = await DirectMessageService.getChannels(userId);

      res.json(dmChannels);
    })
  );

  userRoutes.get(
    "/me/friends",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const friendIds = await FriendService.getFriends(req.signature!.id);
      res.json(friendIds);
    })
  );

  userRoutes.get(
    "/me",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const user = await UserService.getUserById(req.signature!.id);
      res.json(user);
    })
  );

  //Temporary
  userRoutes.get(
    "/presences",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const presences = await UserService.getAllUserPresences(wsManager);
      res.json(presences);
    })
  );

  //Temporary
  userRoutes.get(
    "/",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const users = await UserService.getAllUsers();
      res.json(users);
    })
  );

  //Currently this route isn't used - temporarily disabled as a reminder for testing code
  // userRoutes.get("/:id", authMiddleware, (req, res) =>
  //   UserService.getUserById(req, res)
  // );

  return userRoutes;
}
