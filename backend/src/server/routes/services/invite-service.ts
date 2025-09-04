import {
  ServerInvite,
  ServerInviteCreate,
  ServerMember,
  WSEventType,
} from "../../../../../common/types";
import { ulid } from "ulid";
import { v4 as uuid } from "uuid";
import { ServerInviteRepo } from "../../../db/repos/server-invite.repo";
import { ServerMemberRepo } from "../../../db/repos/server-member.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import { ServerRepo } from "../../../db/repos/server.repo";
import {
  BadRequestError,
  ConflictError,
  GoneError,
  NotFoundError,
} from "../../../errors/errors";

export class InviteService {
  //Create invite
  static async createInvite(inviteCreate: ServerInviteCreate) {
    if (!inviteCreate) throw new BadRequestError("Invite data required");

    //Check permissions

    const createdAt = new Date();
    const expiresOn = inviteCreate.expiresOn
      ? new Date(inviteCreate.expiresOn)
      : new Date();

    expiresOn.setDate(expiresOn.getDate() + 7);

    const invite: ServerInvite = {
      id: ulid(),
      serverId: inviteCreate.serverId,
      link: uuid(),
      createdAt: createdAt.toISOString(),
      expiresOn: expiresOn.toISOString(),
    };

    await ServerInviteRepo.createServerInvite(invite);

    return invite;
  }

  //Get invite (preview)
  static async previewInvite(inviteId: string) {
    const invite = await ServerInviteRepo.getServerInvite(inviteId);
    if (!invite) throw new NotFoundError("Invite doesnt exist");

    return invite;
  }

  //Accept invite
  static async acceptInvite(
    inviteId: string,
    userId: string,
    wsManager: WebSocketManager
  ) {
    const invite = await ServerInviteRepo.getServerInvite(inviteId);

    if (!invite || !invite.serverId)
      throw new NotFoundError("Invite doesn't exist");

    //Check if it is expired
    const now = new Date();
    const expiresOn = new Date(invite.expiresOn);
    if (now > expiresOn) throw new GoneError("Invite has expired");

    //Check if already part of server
    const existingMember = await ServerMemberRepo.getServerMember(
      invite.serverId,
      userId
    );

    if (existingMember)
      throw new BadRequestError("User is already a member of server");

    //Accept
    const server = await ServerRepo.getServer(invite.serverId);
    //Add server member
    const member: ServerMember = {
      userId: userId,
      serverId: server.id,
    };
    await ServerMemberRepo.addServerMember(member);

    //WebSocket message to notify other server members
    const memberIds = await ServerMemberRepo.getServerMemberIds(server.id);
    wsManager.broadcastToGroup(
      WSEventType.SERVER_MEMBER_ADD,
      member,
      memberIds.filter((m) => m !== userId)
    );

    //Return server
    return server;
  }

  //Revoke invite
  static async revokeInvite(inviteId: string) {
    const invite = await ServerInviteRepo.getServerInvite(inviteId);

    if (!invite || !invite.serverId)
      throw new NotFoundError("Invite doesn't exist");

    //Check permissions here

    await ServerInviteRepo.deleteServerInvite(inviteId);
  }

  //Get server invites
  static async getServerInvites(serverId: string) {
    const invites = await ServerInviteRepo.getServerInvites(serverId);
    return invites;
  }
}
