import { ChannelCategory, WSEventType } from "../../../../../common/types";
import { Request, Response } from "express";
import { ChannelCategoryRepo } from "../../../db/repos/category.repo";
import { WebSocketManager } from "../../ws/websocket-manager";

export class CategoryHandler {
  static async deleteCategory(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const categoryId = req.params.categoryId;
      const category = await ChannelCategoryRepo.getCategory(categoryId);

      if (category) {
        await ChannelCategoryRepo.deleteCategory(categoryId);
      } else {
        res.status(404).json({ error: "Category doesn't exist" });
        return;
      }

      wsManager.broadcastToAll(WSEventType.CATEGORY_DELETE, category);

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  }

  static async editCategory(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const categoryId = req.params.categoryId;
      const categoryUpdate = req.body.categoryUpdate as ChannelCategoryRepo;
      const category = await ChannelCategoryRepo.getCategory(categoryId);

      if (category) {
        const proposedCategory = {
          ...category,
          ...categoryUpdate,
        } as ChannelCategory;

        await ChannelCategoryRepo.editCategory(proposedCategory);

        const updatedCategory = await ChannelCategoryRepo.getCategory(
          categoryId
        );

        wsManager.broadcastToAll(WSEventType.CATEGORY_UPDATE, updatedCategory);
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Category doesn't exist" });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to edit category" });
    }
  }
}
