import { Response } from "express";
import { SignedRequest } from "../../../types/types";
import {
  ServerInvite,
  ServerInviteCreate,
  ServerMember,
  WSEventType,
} from "@common/types";
import { ulid } from "ulid";
import { v4 as uuid } from "uuid";
import { ServerInviteRepo } from "../../../db/repos/server-invite.repo";
import { ServerMemberRepo } from "../../../db/repos/server-member.repo";
import { WebSocketManager } from "../../../server/ws/websocket-manager";
import { ServerRepo } from "../../../db/repos/server.repo";

export class InviteHandler {
  //Create invite
  static async createInvite(req: SignedRequest, res: Response) {
    try {
      const newInviteData = req.body as ServerInviteCreate;

      if (!newInviteData) {
        res.status(400).json({ error: "Server data required" });
        return;
      }

      //Check permissions

      const createdAt = new Date();

      const invite: ServerInvite = {
        id: ulid(),
        serverId: newInviteData.serverId,
        link: uuid(),
        createdAt: createdAt.toISOString(),
        expiresOn: newInviteData.expiresOn ?? new Date().toISOString(),
      };

      await ServerInviteRepo.createServerInvite(invite);

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to create invite" });
    }
  }

  //Get invite (preview)
  static async previewInvite(req: SignedRequest, res: Response) {
    try {
      const inviteId = req.params.inviteId;
      const invite = await ServerInviteRepo.getServerInvite(inviteId);

      if (!invite) {
        res.status(404).json({ error: "Invite doesn't exist" });
        return;
      }

      res.json(invite);
    } catch (err) {
      res.status(500).json({ error: "Failed to get invite" });
    }
  }

  //Accept invite
  static async acceptInvite(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const inviteId = req.params.inviteId;
      const invite = await ServerInviteRepo.getServerInvite(inviteId);

      if (!invite || !invite.serverId) {
        res.status(404).json({ error: "Invite doesn't exist" });
        return;
      }

      //Check if it is expired

      //Check if already part of server
      const userId = req.signature.id;

      const existingMember = await ServerMemberRepo.getServerMember(
        invite.serverId,
        userId
      );

      if (existingMember) {
        res.status(400).json({ error: "User already part of server" });
        return;
      }

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
      res.json(server);
    } catch (err) {
      res.status(500).json({ error: "Failed to accept invite" });
    }
  }

  //Revoke invite
  static async revokeInvite(req: SignedRequest, res: Response) {
    try {
      const inviteId = req.params.inviteId;
      const invite = await ServerInviteRepo.getServerInvite(inviteId);

      if (!invite || !invite.serverId) {
        res.status(404).json({ error: "Invite doesn't exist" });
        return;
      }

      //Check permissions here

      await ServerInviteRepo.deleteServerInvite(inviteId);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete invite" });
    }
  }

  //Get server invites
  static async getServerInvites(req: SignedRequest, res: Response) {
    try {
      const serverId = req.params.serverId;
      const invites = await ServerInviteRepo.getServerInvites(serverId);

      res.json(invites);
    } catch (err) {
      res.status(500).json({ error: "Failed to load server invites" });
    }
  }
}
