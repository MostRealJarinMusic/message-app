import { Application } from "express";
import authRoutes from "./auth-routes";
import userRoutes from "./user-routes";
import channelRoutes from "./channel-routes";
import serverRoutes from "./server-routes";

export function registerRoutes(app: Application) {
  app.use("/api/public/auth", authRoutes);
  app.use("/api/private/channels", channelRoutes);
  app.use("/api/private/servers", serverRoutes);
  app.use("/api/private/users", userRoutes);
  // app.use("*", (req, res) => {
  //   res.status(404).json({ error: "Route not found" });
  // });
}
