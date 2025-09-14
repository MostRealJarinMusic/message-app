import { Application } from "express";
import authRoutes from "../auth.routes";
import userRoutes from "../user.routes";
import channelRoutes from "../channel.routes";
import serverRoutes from "../server.routes";
import messageRoutes from "../message.routes";
import categoryRoutes from "../category.routes";
import friendRequestRoutes from "../friend-request.routes";
import inviteRoutes from "../invite.routes";
import { Services } from "../../types/types";

export function createRoutes(app: Application, services: Services) {
  app.use("/api/public/auth", authRoutes(services.auth));
  app.use(
    "/api/private/channels",
    channelRoutes(services.channel, services.message)
  );
  app.use("/api/private/categories", categoryRoutes(services.category));
  app.use(
    "/api/private/servers",
    serverRoutes(services.server, services.channel, services.category)
  );
  app.use(
    "/api/private/users",
    userRoutes(
      services.user,
      services.directMessage,
      services.friend,
      services.presence
    )
  );
  app.use("/api/private/messages", messageRoutes(services.message));
  app.use(
    "/api/private/friend-requests",
    friendRequestRoutes(services.friendRequest)
  );
  app.use("/api/private/invites", inviteRoutes(services.invite));
}
