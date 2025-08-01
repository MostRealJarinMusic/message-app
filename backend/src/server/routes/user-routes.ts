import { Router } from "express";
import { Request, Response } from "express-serve-static-core";
import { authMiddleware } from "../../middleware/auth-middleware";
import { UserHandler } from "./handlers/user-handler";
import { SignedRequest } from "types/types";

const userRoutes = Router();

userRoutes.get("/me", authMiddleware, (req: Request, res: Response) =>
  UserHandler.getMe(req as SignedRequest, res)
);

//Temporary
userRoutes.get("/", authMiddleware, (req: Request, res: Response) =>
  UserHandler.getAllUsers(req, res)
);

//Currently this route isn't used - temporarily disabled as a reminder for testing code
// userRoutes.get("/:id", authMiddleware, (req, res) =>
//   UserHandler.getUserById(req, res)
// );

export default userRoutes;
