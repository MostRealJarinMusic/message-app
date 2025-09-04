import { Request, Response, Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { WebSocketManager } from "../ws/websocket-manager";
import { ServerService } from "./services/server-service";
import { SignedRequest } from "../../types/types";
import { asyncHandler } from "../../utils/async-wrapper";
import { ChannelService } from "./services/channel-service";
import { CategoryService } from "./services/category-service";

export default function serverRoutes(wsManager: WebSocketManager): Router {
  const serverRoutes = Router();

  //Temporarily fetches all servers
  serverRoutes.get(
    "",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const servers = await ServerService.getAllServers(req.signature!.id);
      res.json(servers);
    })
  );

  //Accessing server users
  serverRoutes.get(
    "/:serverId/users",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const users = await ServerService.getServerUsers(req.params.serverId);
      res.json(users);
    })
  );

  //Accessing server user presence
  serverRoutes.get(
    "/:serverId/presences",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const presences = await ServerService.getServerUserPresences(
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
      const channels = await ChannelService.getChannels(req.params.serverId);
      res.json(channels);
    })
  );

  //Creating channel in server
  serverRoutes.post(
    "/:serverId/channels",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const channel = await ChannelService.createChannel(
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
      const categories = await CategoryService.getCategories(
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
      const category = await CategoryService.createCategory(
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
      const server = await ServerService.createServer(
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
      await ServerService.deleteServer(req.params.serverId, wsManager);
      res.status(204).send();
    })
  );

  //Editing a server
  serverRoutes.patch(
    "/:serverId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      await ServerService.editServer(req.params.serverId, req.body, wsManager);
      res.status(204).send();
    })
  );

  //Reordering servers
  //#endregion
  return serverRoutes;
}
