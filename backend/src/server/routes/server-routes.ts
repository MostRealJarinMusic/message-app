import { Request, Response, Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { WebSocketManager } from "../ws/websocket-manager";
import { ServerHandler } from "./handlers/server-handler";
import { SignedRequest } from "../../types/types";
import { asyncHandler } from "../../utils/async-wrapper";
import { ChannelHandler } from "./handlers/channel-handler";
import { CategoryHandler } from "./handlers/category-handler";

export default function serverRoutes(wsManager: WebSocketManager): Router {
  const serverRoutes = Router();

  //Temporarily fetches all servers
  serverRoutes.get(
    "",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const servers = await ServerHandler.getAllServers(req.signature!.id);
      res.json(servers);
    })
  );

  //Accessing server users
  serverRoutes.get(
    "/:serverId/users",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const users = await ServerHandler.getServerUsers(req.params.serverId);
      res.json(users);
    })
  );

  //Accessing server user presence
  serverRoutes.get(
    "/:serverId/presences",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const presences = await ServerHandler.getServerUserPresences(
        req.params.serverId,
        wsManager
      );
      res.json(presences);
    })
  );

  //#region Channel CRUD
  //Accessing server channels
  serverRoutes.get(
    "/:serverId/channels",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const channels = await ChannelHandler.getChannels(req.params.serverId);
      res.json(channels);
    })
  );

  //Creating channel in server
  serverRoutes.post(
    "/:serverId/channels",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const channel = await ChannelHandler.createChannel(
        req.params.serverId,
        req.body,
        wsManager
      );
      res.status(201).json(channel);
    })
  );
  //#endregion

  //#region Categories CRUD
  //Accessing server categories
  serverRoutes.get(
    "/:serverId/structure",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const categories = await CategoryHandler.getCategories(
        req.params.serverId
      );
      res.json(categories);
    })
  );

  //Creating categories
  serverRoutes.post(
    "/:serverId/categories",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const category = await CategoryHandler.createCategory(
        req.params.serverId,
        req.body,
        wsManager
      );
      res.status(201).json(category);
    })
  );
  //#endregion

  //#region Server CRUD
  //Creating a server
  serverRoutes.post(
    "",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const server = await ServerHandler.createServer(
        req.signature!.id,
        req.body,
        wsManager
      );
      res.status(201).json(server);
    })
  );

  //Deleting a server
  serverRoutes.delete(
    "/:serverId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      await ServerHandler.deleteServer(req.params.serverId, wsManager);
      res.status(204).send();
    })
  );

  //Editing a server
  serverRoutes.patch(
    "/:serverId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      await ServerHandler.editServer(req.params.serverId, req.body, wsManager);
      res.status(204).send();
    })
  );

  //Reordering servers
  //#endregion
  return serverRoutes;
}
