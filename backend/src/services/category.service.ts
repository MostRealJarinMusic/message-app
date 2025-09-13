import {
  ChannelCategory,
  ChannelCategoryCreate,
  ChannelCategoryUpdate,
  WSEventType,
} from "../../../common/types";
import { ChannelCategoryRepo } from "../db/repos/category.repo";
import { ChannelRepo } from "../db/repos/channel.repo";
import { ServerMemberRepo } from "../db/repos/server-member.repo";
import { BadRequestError, NotFoundError } from "../errors/errors";
import { ulid } from "ulid";
import { EventBusPort } from "../types/types";

export class CategoryService {
  constructor(
    private readonly categoryRepo: ChannelCategoryRepo,
    private readonly serverMemberRepo: ServerMemberRepo,
    private readonly channelRepo: ChannelRepo,
    private readonly eventBus: EventBusPort
  ) {}

  async getCategories(serverId: string) {
    return this.categoryRepo.getCategories(serverId);
  }

  async createCategory(
    serverId: string,
    categoryCreate: ChannelCategoryCreate
  ) {
    if (!categoryCreate) throw new BadRequestError("Category data required");

    const category: ChannelCategory = {
      id: ulid(),
      serverId,
      name: categoryCreate.name,
    };

    await this.categoryRepo.createCategory(category);

    const memberIds = await this.serverMemberRepo.getServerMemberIds(serverId);
    this.eventBus.publish(WSEventType.CATEGORY_CREATE, category, memberIds);

    return category;
  }

  async deleteCategory(categoryId: string) {
    const category = await this.categoryRepo.getCategory(categoryId);
    if (!category) throw new NotFoundError("Category doesn't exist");

    const targetChannels = await this.channelRepo.getChannelsByCategory(
      categoryId
    );
    const memberIds = await this.serverMemberRepo.getServerMemberIds(
      category.serverId
    );

    await this.categoryRepo.deleteCategory(categoryId);

    this.eventBus.publish(WSEventType.CATEGORY_DELETE, category, memberIds);

    const updatedChannels = targetChannels.map((channel) => ({
      ...channel,
      categoryId: null,
    }));

    updatedChannels.forEach((updatedChannel) => {
      this.eventBus.publish(
        WSEventType.CHANNEL_UPDATE,
        updatedChannel,
        memberIds
      );
    });
  }

  async editCategory(
    categoryId: string,
    categoryUpdate: ChannelCategoryUpdate
  ) {
    const category = await this.categoryRepo.getCategory(categoryId);
    if (!category) throw new NotFoundError("Category doesn't exist");

    const proposedCategory: ChannelCategory = {
      ...category,
      ...categoryUpdate,
    };

    await this.categoryRepo.editCategory(proposedCategory);

    const updatedCategory = await this.categoryRepo.getCategory(categoryId);
    const memberIds = await this.serverMemberRepo.getServerMemberIds(
      updatedCategory.serverId
    );

    this.eventBus.publish(
      WSEventType.CATEGORY_UPDATE,
      updatedCategory,
      memberIds
    );
  }
}
