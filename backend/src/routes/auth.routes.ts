import { AuthService } from "../services/auth.service";
import { Router } from "express";
import { asyncHandler } from "../utils/async-wrapper";

export default function authRoutes(authService: AuthService): Router {
  const authRoutes = Router();

  authRoutes.post(
    "/login",
    asyncHandler(async (req, res) => {
      const result = await authService.login(req.body);
      res.json(result);
    })
  );

  authRoutes.post(
    "/register",
    asyncHandler(async (req, res) => {
      const result = await authService.register(req.body);
      res.json(result);
    })
  );

  return authRoutes;
}
