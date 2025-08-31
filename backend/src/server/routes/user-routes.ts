import { Router } from "express";
import { Request, Response } from "express-serve-static-core";
import { authMiddleware } from "../../middleware/auth-middleware";
import { UserHandler } from "./handlers/user-handler";
import { SignedRequest } from "../../types/types";
import { DirectMessageHandler } from "./handlers/direct-message-handler";
import { FriendHandler } from "./handlers/friend-handler";
import { WebSocketManager } from "../ws/websocket-manager";
import { asyncHandler } from "../../utils/async-wrapper";

export default function userRoutes(wsManager: WebSocketManager): Router {
  const userRoutes = Router();

  userRoutes.get(
    "/me/dms",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const userId = req.signature!.id;
      const dmChannels = await DirectMessageHandler.getChannels(userId);

      res.json(dmChannels);
    })
  );

  userRoutes.get(
    "/me/friends",
    authMiddleware,
    (req: Request, res: Response) => {
      FriendHandler.getFriends(req as SignedRequest, res);
    }
  );

  userRoutes.get("/me", authMiddleware, (req: Request, res: Response) =>
    UserHandler.getMe(req as SignedRequest, res)
  );

  //Temporary
  userRoutes.get(
    "/presences",
    authMiddleware,
    (req: Request, res: Response) => {
      UserHandler.getAllUserPresences(req as SignedRequest, res, wsManager);
    }
  );

  //Temporary
  userRoutes.get("/", authMiddleware, (req: Request, res: Response) =>
    UserHandler.getAllUsers(req, res)
  );

  //Currently this route isn't used - temporarily disabled as a reminder for testing code
  // userRoutes.get("/:id", authMiddleware, (req, res) =>
  //   UserHandler.getUserById(req, res)
  // );

  return userRoutes;
}
