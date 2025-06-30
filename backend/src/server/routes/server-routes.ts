import { Router } from "express";
import { authMiddleware } from "../..//middleware/auth-middleware";
import { ChannelRepo } from "../..//db/repos/channel.repo";
import { ServerRepo } from "../..//db/repos/server.repo";

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

export default serverRoutes;
