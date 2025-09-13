import {
  ServerInvite,
  ServerInviteCreate,
  ServerInvitePreview,
  ServerMember,
  WSEventType,
} from "../../../common/types";
import { ulid } from "ulid";
import { v4 as uuid } from "uuid";
import { BadRequestError, GoneError, NotFoundError } from "../errors/errors";
import { EventBusPort } from "../types/types";
import { ServerInviteRepo } from "../db/repos/server-invite.repo";
import { ServerMemberRepo } from "../db/repos/server-member.repo";
import { ServerRepo } from "../db/repos/server.repo";

export class InviteService {
  constructor(
    private readonly serverInviteRepo: ServerInviteRepo,
    private readonly serverMemberRepo: ServerMemberRepo,
    private readonly serverRepo: ServerRepo,
    private readonly eventBus: EventBusPort
  ) {}

  //Create invite
  async createInvite(inviteCreate: ServerInviteCreate) {
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

    await this.serverInviteRepo.createServerInvite(invite);

    return invite;
  }

  //Get invite (preview)
  async previewInvite(link: string) {
    const invite = await this.serverInviteRepo.getServerInviteByLink(link);

    //Server ID check is temporary
    if (!invite || !invite.serverId)
      throw new NotFoundError("Invite doesnt exist");

    const server = await this.serverRepo.getServer(invite.serverId);
    const totalMembers = (
      await this.serverMemberRepo.getServerMemberIds(invite.serverId)
    ).length;

    const invitePreview: ServerInvitePreview = {
      serverName: server.name,
      totalMembers,
    };

    return invitePreview;
  }

  //Accept invite
  async acceptInvite(link: string, userId: string) {
    const invite = await this.serverInviteRepo.getServerInviteByLink(link);

    if (!invite || !invite.serverId)
      throw new NotFoundError("Invite doesn't exist");

    //Check if it is expired
    const now = new Date();
    const expiresOn = new Date(invite.expiresOn);
    if (now > expiresOn) throw new GoneError("Invite has expired");

    //Check if already part of server
    const existingMember = await this.serverMemberRepo.getServerMember(
      invite.serverId,
      userId
    );

    if (existingMember)
      throw new BadRequestError("User is already a member of server");

    //Accept
    const server = await this.serverRepo.getServer(invite.serverId);
    //Add server member
    const member: ServerMember = {
      userId: userId,
      serverId: server.id,
    };
    await this.serverMemberRepo.addServerMember(member);

    //WebSocket message to notify other server members
    const memberIds = await this.serverMemberRepo.getServerMemberIds(server.id);
    this.eventBus.publish(
      WSEventType.SERVER_MEMBER_ADD,
      member,
      memberIds.filter((m) => m !== userId)
    );

    //WebSocket message to notify other synced clients that they have joined
    this.eventBus.publish(WSEventType.USER_SERVER_JOIN, server, [userId]);

    //Return server
    return server;
  }

  //Revoke invite
  async revokeInvite(link: string) {
    const invite = await this.serverInviteRepo.getServerInviteByLink(link);

    if (!invite || !invite.serverId)
      throw new NotFoundError("Invite doesn't exist");

    //Check permissions here

    await this.serverInviteRepo.deleteServerInvite(invite.id);
  }

  //Get server invites
  async getServerInvites(serverId: string) {
    const invites = await this.serverInviteRepo.getServerInvites(serverId);
    return invites;
  }
}
