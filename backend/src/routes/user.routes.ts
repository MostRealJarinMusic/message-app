import { Router } from "express";
import { Request, Response } from "express-serve-static-core";
import { authMiddleware } from "../middleware/auth-middleware";
import { UserService } from "../services/user.service";
import { SignedRequest } from "../types/types";
import { DirectMessageService } from "../services/direct-message.service";
import { FriendService } from "../services/friend.service";
import { asyncHandler } from "../utils/async-wrapper";
import { PresenceService } from "../services/presence.service";

export default function userRoutes(
  userService: UserService,
  directMessageService: DirectMessageService,
  friendService: FriendService,
  presenceService: PresenceService
): Router {
  const userRoutes = Router();

  userRoutes.get(
    "/me/dms",
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const userId = req.signature!.id;
      const dmChannels = await directMessageService.getChannels(userId);

      res.json(dmChannels);
    })
  );

  userRoutes.get(
    "/me/friends",
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const friendIds = await friendService.getFriendIds(req.signature!.id);
      res.json(friendIds);
    })
  );

  userRoutes.get(
    "/me",
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const user = await userService.getMe(req.signature!.id);
      res.json(user);
    })
  );

  userRoutes.patch(
    "/me",
    asyncHandler(async (req: SignedRequest, res: Response) => {
      await userService.updateUserSettings(req.signature!.id, req.body);

      const user = await userService.getMe(req.signature!.id);
      res.json(user);
    })
  );

  //Temporary
  userRoutes.get(
    "/presences",
    asyncHandler(async (req: Request, res: Response) => {
      const presences = await presenceService.getAllUserPresences();
      res.json(presences);
    })
  );

  //Temporary
  userRoutes.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const users = await userService.getAllUsers();
      res.json(users);
    })
  );

  //Currently this route isn't used - temporarily disabled as a reminder for testing code
  // userRoutes.get("/:id",  (req, res) =>
  //   UserService.getUserById(req, res)
  // );

  return userRoutes;
}
