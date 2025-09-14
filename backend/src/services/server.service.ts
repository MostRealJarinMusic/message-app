import {
  Channel,
  ChannelCategory,
  ChannelType,
  Server,
  ServerCreate,
  ServerMember,
  ServerUpdate,
  WSEventType,
} from "../../../common/types";
import { ulid } from "ulid";
import { ChannelCategoryRepo } from "../db/repos/category.repo";
import { ServerMemberRepo } from "../db/repos/server-member.repo";
import { ServerRepo } from "../db/repos/server.repo";
import { ChannelRepo } from "../db/repos/channel.repo";
import { BadRequestError, NotFoundError } from "../errors/errors";
import { EventBusPort, PresencePort } from "../types/types";
import { PresenceService } from "./presence.service";

export class ServerService {
  constructor(
    private readonly channelCategoryRepo: ChannelCategoryRepo,
    private readonly serverMemberRepo: ServerMemberRepo,
    private readonly serverRepo: ServerRepo,
    private readonly channelRepo: ChannelRepo,
    private readonly eventBus: EventBusPort,
    private readonly presenceService: PresenceService
  ) {}

  //Gets all servers that the user is a member of
  async getAllServers(userId: string) {
    const servers = await this.serverRepo.getServers(userId);
    return servers;
  }

  //Accessing server users
  async getServerUsers(serverId: string) {
    //Check if server exists?

    const members = await this.serverMemberRepo.getServerMembers(serverId);
    return members;
  }

  //Accessing server user presences
  async getServerUserPresences(serverId: string) {
    const memberIds = await this.serverMemberRepo.getServerMemberIds(serverId);
    const presences = this.presenceService.getSnapshot(memberIds);

    return presences;
  }

  //Getting shared server users
  async getSharedServerUserIds(userId: string) {
    const servers = await this.getAllServers(userId);
    const serverIds = servers.map((s) => s.id);

    const allMemberIds =
      await this.serverMemberRepo.getServerMemberIdsByServerIds(serverIds);

    const uniqueIds = Array.from(new Set(allMemberIds));
    return uniqueIds.filter((id) => id !== userId);
  }

  //Creating a server
  async createServer(creatorId: string, serverCreate: ServerCreate) {
    if (!serverCreate) throw new BadRequestError("Server data required");

    const server: Server = {
      id: ulid(),
      name: serverCreate.name,
      description: serverCreate.description,
    };

    await this.serverRepo.createServer(server);
    //Create category
    // - Text channel
    const newCategory: ChannelCategory = {
      id: ulid(),
      serverId: server.id,
      name: "Text Channels",
    };
    await this.channelCategoryRepo.createCategory(newCategory);

    // - Create general
    const newChannel: Channel = {
      id: ulid(),
      type: ChannelType.TEXT,
      serverId: server.id,
      name: "General",
      categoryId: newCategory.id,
      createdBy: creatorId,
    };
    await this.channelRepo.createChannel(newChannel);

    //Add server member
    const member: ServerMember = {
      userId: creatorId,
      serverId: server.id,
    };
    await this.serverMemberRepo.addServerMember(member);

    // With public servers, we may have to notify people
    //Broadcast to creator
    this.eventBus.publish(WSEventType.SERVER_CREATE, server);

    return server;
  }

  //Deleting a server
  async deleteServer(serverId: string) {
    const server = await this.serverRepo.getServer(serverId);
    if (!server) throw new NotFoundError("Server doesn't exist");

    this.eventBus.publish(WSEventType.SERVER_DELETE, server);
    await this.serverRepo.deleteServer(serverId);
  }

  //Editing a server
  async editServer(serverId: string, serverUpdate: ServerUpdate) {
    const server = await this.serverRepo.getServer(serverId);
    if (!server) throw new NotFoundError("Server doesn't exist");

    const proposedServer = {
      ...server,
      ...serverUpdate,
    } as Server;

    await this.serverRepo.editServer(proposedServer);
    const updatedServer = await this.serverRepo.getServer(serverId);

    this.eventBus.publish(WSEventType.SERVER_UPDATE, updatedServer);
  }
}
