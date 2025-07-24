import { Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { ChannelRepo } from "../../db/repos/channel.repo";
import { ServerRepo } from "../../db/repos/server.repo";
import {
  Channel,
  ChannelCategory,
  Server,
  ServerCreate,
  WSEventType,
} from "../../../../common/types";
import { ulid } from "ulid";
import { WebSocketManager } from "../ws/websocket-manager";
import { ChannelCategoryRepo } from "../../db/repos/category.repo";

export default function serverRoutes(wsManager: WebSocketManager): Router {
  const serverRoutes = Router();

  //Temporarily fetches all servers
  serverRoutes.get("/", authMiddleware, async (req, res) => {
    try {
      //const userId = (req as any).signature.id;
      //For now, we will assume that all users have access to all servers from login

      const servers = await ServerRepo.getServers();
      res.json(servers);
    } catch (err) {
      console.error("Error getting servers", err);
      res.status(500).json({ error: "Failed to fetch servers" });
    }
  });

  //Accessing server channels
  serverRoutes.get("/:serverId/channels", authMiddleware, async (req, res) => {
    try {
      //console.log("HTTP: Attempt to get channels");
      const serverId = req.params.serverId;
      const channels = await ChannelRepo.getChannels(serverId);

      res.json(channels);
    } catch (err) {
      console.error("Error getting channels", err);
      res.status(500).json({ error: "Failed to fetch channels" });
    }
  });

  //Creating channel in server
  serverRoutes.post("/:serverId/channels", authMiddleware, async (req, res) => {
    try {
      const serverId = req.params.serverId;
      const newChannelData = req.body;

      if (!newChannelData) {
        res.status(400).json({ error: "Channel data required" });
        return;
      }

      const newChannel: Channel = {
        name: newChannelData.name,
        categoryId: newChannelData.categoryId,
        serverId: serverId,
        id: ulid(),
      };

      await ChannelRepo.createChannel(newChannel);

      //Notify all users of a channel creation
      wsManager.broadcastToAll(WSEventType.CHANNEL_CREATE, newChannel);

      res.status(201).json(newChannel);
    } catch (err) {
      res.status(500).json({ error: "Failed to create channel" });
    }
  });

  //Accessing server categories
  serverRoutes.get("/:serverId/structure", authMiddleware, async (req, res) => {
    try {
      const serverId = req.params.serverId;
      const categories = await ChannelCategoryRepo.getCategories(serverId);

      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch structure" });
    }
  });

  //Creating categories

  //Deleting categories

  //Editing categories

  //Reordering categories

  //Creating a server
  serverRoutes.post("/", authMiddleware, async (req, res) => {
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
  });

  //Deleting a server
  serverRoutes.delete("/:serverId", authMiddleware, async (req, res) => {
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
  });

  //Editing a server

  //Reordering servers

  return serverRoutes;
}
