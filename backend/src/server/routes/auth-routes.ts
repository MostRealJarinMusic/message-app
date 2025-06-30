import { Router } from "express";
import { AuthService } from "../../services/auth-service";

const authRoutes = Router();
const authService = new AuthService();

authRoutes.post("/login", (req, res) => authService.login(req, res));
authRoutes.post("/register", (req, res) => authService.register(req, res));

export default authRoutes;
