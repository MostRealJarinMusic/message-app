import { Router } from "express";
import { WebSocketManager } from "../ws/websocket-manager";
import { authMiddleware } from "../../middleware/auth-middleware";
import { ChannelCategoryRepo } from "../../db/repos/category.repo";
import {
  ChannelCategory,
  ChannelCategoryUpdate,
  WSEventType,
} from "../../../../common/types";
import { ChannelRepo } from "../../db/repos/channel.repo";

export default function categoryRoutes(wsManager: WebSocketManager): Router {
  const categoryRoutes = Router();

  //Deleting categories
  categoryRoutes.delete("/:categoryId", authMiddleware, async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      const category = await ChannelCategoryRepo.getCategory(categoryId);

      if (category) {
        const serverId = category.serverId;

        await ChannelCategoryRepo.deleteCategory(categoryId);
        console.log(await ChannelRepo.getChannels(serverId));
      } else {
        res.status(404).json({ error: "Category doesn't exist" });
        return;
      }

      wsManager.broadcastToAll(WSEventType.CATEGORY_DELETE, category);

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  //Editing categories
  categoryRoutes.patch("/:categoryId", authMiddleware, async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      const categoryUpdate = req.body.categoryUpdate as ChannelCategoryUpdate;
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
  });

  //Reordering categories

  //Get single category

  return categoryRoutes;
}
