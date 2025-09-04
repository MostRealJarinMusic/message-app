import { AuthService } from "./services/auth-service";
import { Router } from "express";
import { asyncHandler } from "../../utils/async-wrapper";

const authRoutes = Router();

authRoutes.post(
  "/login",
  asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body);
    res.json(result);
  })
);
authRoutes.post(
  "/register",
  asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.json(result);
  })
);

export default authRoutes;
