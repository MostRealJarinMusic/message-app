import { AuthService } from "../services/auth.service";
import { Router } from "express";
import { asyncHandler } from "../utils/async-wrapper";
import { UnauthorizedError } from "../errors/errors";

export default function authRoutes(authService: AuthService): Router {
  const authRoutes = Router();

  authRoutes.post(
    "/login",
    asyncHandler(async (req, res) => {
      const result = await authService.login(req.body);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
      });

      res.json({ token: result.token });
    })
  );

  authRoutes.post(
    "/register",
    asyncHandler(async (req, res) => {
      const result = await authService.register(req.body);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
      });

      res.json({ token: result.token });
    })
  );

  authRoutes.post(
    "/refresh",
    asyncHandler(async (req, res) => {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken)
        throw new UnauthorizedError("No refresh token provided");

      const newToken = authService.refresh(refreshToken);

      res.json({ token: newToken });
    })
  );

  authRoutes.post(
    "/logout",
    asyncHandler(async (req, res) => {
      res.clearCookie("refreshToken");
      await authService.logout();
      res.status(204).send();
    })
  );

  return authRoutes;
}
