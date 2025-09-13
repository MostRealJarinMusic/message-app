import { AuthService } from "../../services/auth.service";
import { CategoryService } from "../../services/category.service";
import { EventBusPort, PresencePort, Repos, Services } from "../../types/types";
import { ChannelService } from "../channel.service";
import { DirectMessageService } from "../direct-message.service";
import { FriendRequestService } from "../friend-request.service";
import { FriendService } from "../friend.service";
import { InviteService } from "../invite.service";
import { MessageService } from "../message.service";
import { RelevanceService } from "../relevance.service";
import { ServerService } from "../server.service";
import { UserService } from "../user.service";

export function createServices(
  repos: Repos,
  eventBus: EventBusPort,
  presenceManager: PresencePort
): Services {
  const authService = new AuthService(repos.user);
  const categoryService = new CategoryService(
    repos.category,
    repos.serverMember,
    repos.channel,
    eventBus
  );
  const channelService = new ChannelService(
    repos.channel,
    repos.serverMember,
    eventBus
  );
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

  const messageService = new MessageService(
    repos.message,
    repos.channel,
    repos.serverMember,
    repos.dmChannel,
    eventBus
  );

  const serverService = new ServerService(
    repos.category,
    repos.serverMember,
    repos.server,
    repos.channel,
    eventBus,
    presenceManager
  );

  const relevanceService = new RelevanceService(friendService, serverService);

  const userService = new UserService(
    repos.user,
    relevanceService,
    eventBus,
    presenceManager
  );

  return {
    auth: authService,
    category: categoryService,
    channel: channelService,
    directMessage: directMessageService,
    friendRequest: friendRequestService,
    friend: friendService,
    invite: inviteService,
    message: messageService,
    relevance: relevanceService,
    server: serverService,
    user: userService,
  };
}
