import {
  ChannelCategory,
  ChannelCategoryUpdate,
  WSEventType,
} from "../../../../../common/types";
import { Request, Response } from "express";
import { ChannelCategoryRepo } from "../../../db/repos/category.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import { ServerMemberRepo } from "../../../db/repos/server-member.repo";
import { NotFoundError } from "../../../errors/errors";
import { ChannelRepo } from "../../../db/repos/channel.repo";

export class CategoryHandler {
  static async deleteCategory(categoryId: string, wsManager: WebSocketManager) {
    const category = await ChannelCategoryRepo.getCategory(categoryId);

    if (!category) throw new NotFoundError("Category doesn't exist");

    const targetChannels = await ChannelRepo.getChannelsByCategory(categoryId);

    const memberIds = await ServerMemberRepo.getServerMemberIds(
      category.serverId
    );

    await ChannelCategoryRepo.deleteCategory(categoryId);
    wsManager.broadcastToGroup(
      WSEventType.CATEGORY_DELETE,
      category,
      memberIds
    );

    const updatedChannels = targetChannels.map((channel) => ({
      ...channel,
      categoryId: null,
    }));

    updatedChannels.forEach((updatedChannel) => {
      wsManager.broadcastToGroup(
        WSEventType.CHANNEL_UPDATE,
        updatedChannel,
        memberIds
      );
    });
  }

  static async editCategory(
    categoryId: string,
    categoryUpdate: ChannelCategoryUpdate,
    wsManager: WebSocketManager
  ) {
    const category = await ChannelCategoryRepo.getCategory(categoryId);

    if (!category) throw new NotFoundError("Category doesn't exist");

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
  }
}
