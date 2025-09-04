import {
  ChannelCategory,
  ChannelCategoryCreate,
  ChannelCategoryUpdate,
  WSEventType,
} from "../../../../../common/types";
import { ChannelCategoryRepo } from "../../../db/repos/category.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import { ServerMemberRepo } from "../../../db/repos/server-member.repo";
import { BadRequestError, NotFoundError } from "../../../errors/errors";
import { ChannelRepo } from "../../../db/repos/channel.repo";
import { ulid } from "ulid";

export class CategoryService {
  //Accessing server categories
  static async getCategories(serverId: string) {
    const categories = await ChannelCategoryRepo.getCategories(serverId);

    return categories;
  }

  //Creating categories in server
  static async createCategory(
    serverId: string,
    categoryCreate: ChannelCategoryCreate,
    wsManager: WebSocketManager
  ) {
    if (!categoryCreate) throw new BadRequestError("Category data required");

    const category: ChannelCategory = {
      id: ulid(),
      serverId: serverId,
      name: categoryCreate.name,
    };

    await ChannelCategoryRepo.createCategory(category);

    const memberIds = await ServerMemberRepo.getServerMemberIds(serverId);
    wsManager.broadcastToGroup(
      WSEventType.CATEGORY_CREATE,
      category,
      memberIds
    );

    return category;
  }

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
