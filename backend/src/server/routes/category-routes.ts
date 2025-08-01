import { Request, Response, Router } from "express";
import { WebSocketManager } from "../ws/websocket-manager";
import { authMiddleware } from "../../middleware/auth-middleware";
import { ChannelCategoryRepo } from "../../db/repos/category.repo";
import {
  ChannelCategory,
  ChannelCategoryUpdate,
  WSEventType,
} from "../../../../common/types";
import { ChannelRepo } from "../../db/repos/channel.repo";
import { CategoryHandler } from "./handlers/category-handler";

export default function categoryRoutes(wsManager: WebSocketManager): Router {
  const categoryRoutes = Router();

  //Deleting categories
  categoryRoutes.delete(
    "/:categoryId",
    authMiddleware,
    async (req: Request, res: Response) => {
      CategoryHandler.deleteCategory(req, res, wsManager);
    }
  );

  //Editing categories
  categoryRoutes.patch(
    "/:categoryId",
    authMiddleware,
    async (req: Request, res: Response) => {
      CategoryHandler.editCategory(req, res, wsManager);
    }
  );

  //Reordering categories

  //Get single category

  return categoryRoutes;
}
