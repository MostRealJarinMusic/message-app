import { Request, Response } from "express";
import { ServerRepo } from "../../../db/repos/server.repo";
import { UserRepo } from "../../../db/repos/user.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import { ChannelRepo } from "../../../db/repos/channel.repo";
import {
  Channel,
  ChannelCategory,
  ChannelType,
  Server,
  ServerCreate,
  ServerUpdate,
  WSEventType,
} from "../../../../../common/types";
import { ulid } from "ulid";
import { ChannelCategoryRepo } from "../../../db/repos/category.repo";

export class ServerHandler {
  //Temporarily fetches all servers
  static async getAllServers(req: Request, res: Response) {
    try {
      //const userId = (req as any).signature.id;
      //For now, we will assume that all users have access to all servers from login

      const servers = await ServerRepo.getServers();

      res.json(servers);
    } catch (err) {
      console.error("Error getting servers", err);
      res.status(500).json({ error: "Failed to fetch servers" });
    }
  }

  //Accessing server users
  static async getServerUsers(req: Request, res: Response) {
    try {
      const serverId = req.params.serverId;

      //Here, you get the users for a server
      const users = await UserRepo.getAllUsers();

      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to load users" });
    }
  }

  //Accessing server user presences
  static async getServerUserPresences(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const serverId = req.params.serverId;

      //Here, you would get the user IDs for a server
      const users = await UserRepo.getAllUsers();
      const userIds = users.map((u) => u.id);

      const presences = wsManager.getPresenceSnapshot(userIds);

      res.json(presences);
    } catch (err) {
      res.status(500).json({ error: "Failed to load presence" });
    }
  }

  //Accessing server channels
  static async getChannels(req: Request, res: Response) {
    try {
      const serverId = req.params.serverId;
      const channels = await ChannelRepo.getChannels(serverId);

      res.json(channels);
    } catch (err) {
      console.error("Error getting channels", err);
      res.status(500).json({ error: "Failed to fetch channels" });
    }
  }

  //Creating channel in server
  static async createChannel(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const serverId = req.params.serverId;
      const newChannelData = req.body;

      if (!newChannelData) {
        res.status(400).json({ error: "Channel data required" });
        return;
      }

      const newChannel: Channel = {
        name: newChannelData.name,
        type: ChannelType.TEXT,
        categoryId: newChannelData.categoryId,
        serverId: serverId,
        id: ulid(),
      };

      await ChannelRepo.createChannel(newChannel);

      //Notify all users of a channel creation
      //Eventually, move to only server users
      const serverUserIds = (await UserRepo.getAllUsers()).map((u) => u.id);
      wsManager.broadcastToGroup(
        WSEventType.CHANNEL_CREATE,
        newChannel,
        serverUserIds
      );

      res.status(201).json(newChannel);
    } catch (err) {
      res.status(500).json({ error: "Failed to create channel" });
    }
  }

  //Accessing server categories
  static async getCategories(req: Request, res: Response) {
    try {
      const serverId = req.params.serverId;
      const categories = await ChannelCategoryRepo.getCategories(serverId);

      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch structure" });
    }
  }

  //Creating categories in server
  static async createCategory(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const serverId = req.params.serverId;
      const newCategoryData = req.body;

      if (!newCategoryData) {
        res.status(400).json({ error: "Category data required" });
        return;
      }

      const newCategory: ChannelCategory = {
        id: ulid(),
        serverId: serverId,
        name: newCategoryData.name,
      };

      await ChannelCategoryRepo.createCategory(newCategory);

      wsManager.broadcastToAll(WSEventType.CATEGORY_CREATE, newCategory);

      res.status(201).json(newCategory);
    } catch (err) {
      res.status(500).json({ error: "Failed to create category" });
    }
  }

  //Creating a server
  static async createServer(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const newServerData = req.body as ServerCreate;

      if (!newServerData) {
        res.status(400).json({ error: "Server data required" });
        return;
      }

      const newServer: Server = {
        id: ulid(),
        name: newServerData.name,
        description: newServerData.description,
      };

      await ServerRepo.createServer(newServer);
      //Create category
      // - Text channel
      const newCategory: ChannelCategory = {
        id: ulid(),
        serverId: newServer.id,
        name: "Text Channels",
      };
      await ChannelCategoryRepo.createCategory(newCategory);

      // - Create general
      const newChannel: Channel = {
        id: ulid(),
        type: ChannelType.TEXT,
        serverId: newServer.id,
        name: "General",
        categoryId: newCategory.id,
      };
      await ChannelRepo.createChannel(newChannel);

      //Notify all users of server creation - temporarily
      //In reality - only notify the person who created the server
      // With public servers, we may have to notify people

      //For now notify everyone

      wsManager.broadcastToAll(WSEventType.SERVER_CREATE, newServer);

      res.status(201).json(newServer);
    } catch (err) {
      res.status(500).json({ error: "Failed to create server" });
    }
  }

  //Deleting a server
  static async deleteServer(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const serverId = req.params.serverId;
      const server = await ServerRepo.getServer(serverId);

      if (server) {
        await ServerRepo.deleteServer(serverId);
      } else {
        res.status(404).json({ error: "Server doesn't exist" });
        return;
      }

      wsManager.broadcastToAll(WSEventType.SERVER_DELETE, server);

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete server" });
    }
  }

  //Editing a server
  static async editServer(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const serverId = req.params.serverId;
      const serverUpdate = req.body.serverUpdate as ServerUpdate;
      const server = await ServerRepo.getServer(serverId);

      if (server) {
        const proposedServer = {
          ...server,
          ...serverUpdate,
        } as Server;

        await ServerRepo.editServer(proposedServer);

        const updatedServer = await ServerRepo.getServer(serverId);

        wsManager.broadcastToAll(WSEventType.SERVER_UPDATE, updatedServer);
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Server doesn't exist" });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to edit server" });
    }
  }
}
