import { Router, Request, Response } from "express";
import { AuthHandler } from "../../handlers/auth-handler";

const authRoutes = Router();
const authService = new AuthHandler();

authRoutes.post("/login", (req: Request, res: Response) =>
  authService.login(req, res)
);
authRoutes.post("/register", (req: Request, res: Response) =>
  authService.register(req, res)
);

export default authRoutes;
