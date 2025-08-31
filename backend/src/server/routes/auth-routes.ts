import { Request, Response } from "express";
import { AuthHandler } from "./handlers/auth-handler";
import { Router } from "express";

const authRoutes = Router();

authRoutes.post("/login", async (req: Request, res: Response) => {
  try {
    const result = await AuthHandler.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: (err as Error).message });
  }
});
authRoutes.post("/register", async (req: Request, res: Response) => {
  try {
    const result = await AuthHandler.register(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: (err as Error).message });
  }
});

export default authRoutes;
