import { Request, Response } from "express";
import { ServerRepo } from "../../../db/repos/server.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import { ChannelRepo } from "../../../db/repos/channel.repo";
import {
  Channel,
  ChannelCategory,
  ChannelType,
  Server,
  ServerCreate,
  ServerMember,
  ServerUpdate,
  WSEventType,
} from "../../../../../common/types";
import { ulid } from "ulid";
import { ChannelCategoryRepo } from "../../../db/repos/category.repo";
import { SignedRequest } from "../../../types/types";
import { ServerMemberRepo } from "../../../db/repos/server-member.repo";
import { BadRequestError, NotFoundError } from "../../../errors/errors";

export class ServerService {
  //Gets all servers that the user is a member of
  static async getAllServers(userId: string) {
    const servers = await ServerRepo.getServers(userId);
    return servers;
  }

  //Accessing server users
  static async getServerUsers(serverId: string) {
    //Check if server exists?

    const members = await ServerMemberRepo.getServerMembers(serverId);
    return members;
  }

  //Accessing server user presences
  static async getServerUserPresences(
    serverId: string,
    wsManager: WebSocketManager
  ) {
    const memberIds = await ServerMemberRepo.getServerMemberIds(serverId);
    const presences = wsManager.getPresenceSnapshot(memberIds);

    return presences;
  }

  //Creating a server
  static async createServer(
    creatorId: string,
    serverCreate: ServerCreate,
    wsManager: WebSocketManager
  ) {
    if (!serverCreate) throw new BadRequestError("Server data required");

    const server: Server = {
      id: ulid(),
      name: serverCreate.name,
      description: serverCreate.description,
    };

    await ServerRepo.createServer(server);
    //Create category
    // - Text channel
    const newCategory: ChannelCategory = {
      id: ulid(),
      serverId: server.id,
      name: "Text Channels",
    };
    await ChannelCategoryRepo.createCategory(newCategory);

    // - Create general
    const newChannel: Channel = {
      id: ulid(),
      type: ChannelType.TEXT,
      serverId: server.id,
      name: "General",
      categoryId: newCategory.id,
      createdBy: creatorId,
    };
    await ChannelRepo.createChannel(newChannel);

    //Add server member
    const member: ServerMember = {
      userId: creatorId,
      serverId: server.id,
    };
    await ServerMemberRepo.addServerMember(member);

    // With public servers, we may have to notify people
    //Broadcast to creator
    wsManager.broadcastToUser(WSEventType.SERVER_CREATE, server, creatorId);

    return server;
  }

  //Deleting a server
  static async deleteServer(serverId: string, wsManager: WebSocketManager) {
    const server = await ServerRepo.getServer(serverId);
    if (!server) throw new NotFoundError("Server doesn't exist");

    const memberIds = await ServerMemberRepo.getServerMemberIds(serverId);

    await ServerRepo.deleteServer(serverId);

    wsManager.broadcastToGroup(WSEventType.SERVER_DELETE, server, memberIds);
  }

  //Editing a server
  static async editServer(
    serverId: string,
    serverUpdate: ServerUpdate,
    wsManager: WebSocketManager
  ) {
    const server = await ServerRepo.getServer(serverId);
    if (!server) throw new NotFoundError("Server doesn't exist");

    const proposedServer = {
      ...server,
      ...serverUpdate,
    } as Server;

    await ServerRepo.editServer(proposedServer);
    const updatedServer = await ServerRepo.getServer(serverId);

    const memberIds = await ServerMemberRepo.getServerMemberIds(serverId);
    wsManager.broadcastToGroup(
      WSEventType.SERVER_UPDATE,
      updatedServer,
      memberIds
    );
  }
}
