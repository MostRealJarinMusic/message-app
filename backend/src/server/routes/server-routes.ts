import { Request, Response, Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { WebSocketManager } from "../ws/websocket-manager";
import { ServerHandler } from "./handlers/server-handler";
import { SignedRequest } from "../../types/types";

export default function serverRoutes(wsManager: WebSocketManager): Router {
  const serverRoutes = Router();

  //Temporarily fetches all servers
  serverRoutes.get("", authMiddleware, async (req: Request, res: Response) => {
    ServerHandler.getAllServers(req, res);
  });

  //Accessing server users
  serverRoutes.get(
    "/:serverId/users",
    authMiddleware,
    async (req: Request, res: Response) => {
      ServerHandler.getServerUsers(req, res);
    }
  );

  //Accessing server user presence
  serverRoutes.get(
    "/:serverId/presences",
    authMiddleware,
    async (req: Request, res: Response) => {
      ServerHandler.getServerUserPresences(req, res, wsManager);
    }
  );

  //#region Channel CRUD
  //Accessing server channels
  serverRoutes.get(
    "/:serverId/channels",
    authMiddleware,
    async (req: Request, res: Response) => {
      ServerHandler.getChannels(req, res);
    }
  );

  //Creating channel in server
  serverRoutes.post(
    "/:serverId/channels",
    authMiddleware,
    async (req: Request, res: Response) => {
      ServerHandler.createChannel(req, res, wsManager);
    }
  );
  //#endregion

  //#region Categories CRUD
  //Accessing server categories
  serverRoutes.get(
    "/:serverId/structure",
    authMiddleware,
    async (req: Request, res: Response) => {
      ServerHandler.getCategories(req, res);
    }
  );

  //Creating categories
  serverRoutes.post(
    "/:serverId/categories",
    authMiddleware,
    async (req: Request, res: Response) => {
      ServerHandler.createCategory(req, res, wsManager);
    }
  );
  //#endregion

  //#region Server CRUD
  //Creating a server
  serverRoutes.post("", authMiddleware, async (req: Request, res: Response) => {
    ServerHandler.createServer(req as SignedRequest, res, wsManager);
  });

  //Deleting a server
  serverRoutes.delete(
    "/:serverId",
    authMiddleware,
    async (req: Request, res: Response) => {
      ServerHandler.deleteServer(req, res, wsManager);
    }
  );

  //Editing a server
  serverRoutes.patch(
    "/:serverId",
    authMiddleware,
    async (req: Request, res: Response) => {
      ServerHandler.editServer(req, res, wsManager);
    }
  );

  //Reordering servers
  //#endregion
  return serverRoutes;
}
