import { Request, Response, Router } from "express";
import { WebSocketManager } from "../ws/websocket-manager";
import { authMiddleware } from "../../middleware/auth-middleware";
import { CategoryHandler } from "./handlers/category-handler";
import { asyncHandler } from "../../utils/async-wrapper";

export default function categoryRoutes(wsManager: WebSocketManager): Router {
  const categoryRoutes = Router();

  //Deleting categories
  categoryRoutes.delete(
    "/:categoryId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      await CategoryHandler.deleteCategory(req.params.categoryId, wsManager);
      res.status(204).send();
    })
  );

  //Editing categories
  categoryRoutes.patch(
    "/:categoryId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      await CategoryHandler.editCategory(
        req.params.categoryId,
        req.body,
        wsManager
      );
    })
  );

  //Reordering categories

  //Get single category

  return categoryRoutes;
}
