import { AuthService } from "../../services/auth.service";
import { CategoryService } from "../../services/category.service";
import { EventBusPort, PresencePort, Repos, Services } from "../../types/types";
import { ConnectionRegistry } from "../../websocket/connection-registry";
import { ChannelService } from "../channel.service";
import { DirectMessageService } from "../direct-message.service";
import { FriendRequestService } from "../friend-request.service";
import { FriendService } from "../friend.service";
import { HeartbeatService } from "../heartbeat.service";
import { InviteService } from "../invite.service";
import { MessageService } from "../message.service";
import { PresenceService } from "../presence.service";
import { RelevanceService } from "../relevance.service";
import { ServerService } from "../server.service";
import { TypingService } from "../typing.service";
import { UserService } from "../user.service";

export function createServices(
  repos: Repos,
  eventBus: EventBusPort,
  registry: ConnectionRegistry
): Services {
  const presenceService = new PresenceService(repos.user, eventBus);

  const authService = new AuthService(repos.user);
  const categoryService = new CategoryService(
    repos.category,
    repos.channel,
    eventBus
  );
  const channelService = new ChannelService(repos.channel, eventBus);
  const directMessageService = new DirectMessageService(repos.dmChannel);
  const friendRequestService = new FriendRequestService(
    repos.friendRequest,
    repos.friend,
    repos.user,
    repos.channel,
    repos.dmChannel,
    eventBus
  );

  const friendService = new FriendService(repos.friend);
  const inviteService = new InviteService(
    repos.serverInvite,
    repos.serverMember,
    repos.server,
    eventBus
  );

  const serverService = new ServerService(
    repos.category,
    repos.serverMember,
    repos.server,
    repos.channel,
    eventBus,
    presenceService
  );

  const messageService = new MessageService(
    repos.message,
    repos.channel,
    eventBus
  );

  const userService = new UserService(repos.user, eventBus);

  const heartbeatService = new HeartbeatService(registry);

  const typingService = new TypingService(repos.channel, eventBus);

  const relevanceService = new RelevanceService(
    friendService,
    serverService,
    repos.channel,
    repos.serverMember,
    repos.dmChannel
  );

  return {
    auth: authService,
    category: categoryService,
    channel: channelService,
    directMessage: directMessageService,
    friendRequest: friendRequestService,
    friend: friendService,
    heartbeat: heartbeatService,
    invite: inviteService,
    message: messageService,
    presence: presenceService,
    relevance: relevanceService,
    server: serverService,
    typing: typingService,
    user: userService,
  };
}
