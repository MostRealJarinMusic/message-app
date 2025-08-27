import { ChannelCategory, WSEventType } from "../../../../../common/types";
import { Request, Response } from "express";
import { ChannelCategoryRepo } from "../../../db/repos/category.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import { ServerMemberRepo } from "src/db/repos/server-member.repo";

export class CategoryHandler {
  static async deleteCategory(
    req: Request,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const categoryId = req.params.categoryId;
      const category = await ChannelCategoryRepo.getCategory(categoryId);

      if (!category) {
        res.status(404).json({ error: "Category doesn't exist" });
        return;
      }

      const memberIds = await ServerMemberRepo.getServerMemberIds(
        category.serverId
      );

      await ChannelCategoryRepo.deleteCategory(categoryId);
      wsManager.broadcastToGroup(
        WSEventType.CATEGORY_DELETE,
        category,
        memberIds
      );

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

      if (!category) {
        res.status(404).json({ error: "Category doesn't exist" });
        return;
      }

      const proposedCategory = {
        ...category,
        ...categoryUpdate,
      } as ChannelCategory;

      await ChannelCategoryRepo.editCategory(proposedCategory);

      const updatedCategory = await ChannelCategoryRepo.getCategory(categoryId);
      const memberIds = await ServerMemberRepo.getServerMemberIds(
        updatedCategory.serverId
      );

      wsManager.broadcastToGroup(
        WSEventType.CATEGORY_UPDATE,
        updatedCategory,
        memberIds
      );
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to edit category" });
    }
  }
}
