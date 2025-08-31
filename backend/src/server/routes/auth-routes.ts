import { Request, Response } from "express";
import { AuthHandler } from "./handlers/auth-handler";
import { Router } from "express";
import { asyncHandler } from "../../utils/async-wrapper";

const authRoutes = Router();

authRoutes.post(
  "/login",
  asyncHandler(async (req, res) => {
    const result = await AuthHandler.login(req.body);
    res.json(result);
  })
);
authRoutes.post(
  "/register",
  asyncHandler(async (req, res) => {
    const result = await AuthHandler.register(req.body);
    res.json(result);
  })
);

export default authRoutes;
