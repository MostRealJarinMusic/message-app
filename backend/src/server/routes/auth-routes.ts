import { Request, Response } from "express";
import { AuthHandler } from "../../handlers/auth-handler";
import { Router } from "express";

const authRoutes = Router();

authRoutes.post("/login", (req: Request, res: Response) =>
  AuthHandler.login(req, res)
);
authRoutes.post("/register", (req: Request, res: Response) =>
  AuthHandler.register(req, res)
);

export default authRoutes;
