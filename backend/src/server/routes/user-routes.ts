import { Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { UserRepo } from "../../db/repos/user.repo";

const userRoutes = Router();

userRoutes.get("/me/", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).signature.id;
    const user = await UserRepo.getUserById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

userRoutes.get("/:id", authMiddleware, async (req, res) => {
  const user = await UserRepo.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});

export default userRoutes;
