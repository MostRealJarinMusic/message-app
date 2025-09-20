import { Application, Router } from "express";
import authRoutes from "../auth.routes";
import userRoutes from "../user.routes";
import channelRoutes from "../channel.routes";
import serverRoutes from "../server.routes";
import messageRoutes from "../message.routes";
import categoryRoutes from "../category.routes";
import friendRequestRoutes from "../friend-request.routes";
import inviteRoutes from "../invite.routes";
import { Services } from "../../types/types";
import { authMiddleware } from "../../middleware/auth-middleware";

export function createRoutes(app: Application, services: Services) {
  app.use("/api/public/auth", authRoutes(services.auth));

  const privateRouter = Router();
  privateRouter.use(authMiddleware);

  privateRouter.use(
    "/channels",
    channelRoutes(services.channel, services.message)
  );
  privateRouter.use("/categories", categoryRoutes(services.category));
  privateRouter.use(
    "/servers",
    serverRoutes(services.server, services.channel, services.category)
  );
  privateRouter.use(
    "/users",
    userRoutes(
      services.user,
      services.directMessage,
      services.friend,
      services.presence
    )
  );
  privateRouter.use("/messages", messageRoutes(services.message));
  privateRouter.use(
    "/friend-requests",
    friendRequestRoutes(services.friendRequest)
  );
  privateRouter.use("/invites", inviteRoutes(services.invite));

  app.use("/api/private", privateRouter);
}
