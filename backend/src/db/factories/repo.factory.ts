import { DB } from "../db";
import { Repos } from "../../types/types";
import { UserRepo } from "../repos/user.repo";
import { ChannelRepo } from "../repos/channel.repo";
import { ChannelCategoryRepo } from "../repos/category.repo";
import { DMChannelRepo } from "../repos/dm-channel.repo";
import { FriendRequestRepo } from "../repos/friend-request.repo";
import { FriendRepo } from "../repos/friend.repo";
import { MessageRepo } from "../repos/message.repo";
import { ServerInviteRepo } from "../repos/server-invite.repo";
import { ServerMemberRepo } from "../repos/server-member.repo";
import { ServerRepo } from "../repos/server.repo";

export function createRepos(db: DB): Repos {
  return {
    category: new ChannelCategoryRepo(db),
    channel: new ChannelRepo(db),
    dmChannel: new DMChannelRepo(db),
    friendRequest: new FriendRequestRepo(db),
    friend: new FriendRepo(db),
    message: new MessageRepo(db),
    serverInvite: new ServerInviteRepo(db),
    serverMember: new ServerMemberRepo(db),
    server: new ServerRepo(db),
    user: new UserRepo(db),
  };
}
