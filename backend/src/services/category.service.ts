import {
  ChannelCategory,
  ChannelCategoryCreate,
  ChannelCategoryUpdate,
  WSEventType,
} from "../../../common/types";
import { ChannelCategoryRepo } from "../db/repos/category.repo";
import { ChannelRepo } from "../db/repos/channel.repo";
import { BadRequestError, NotFoundError } from "../errors/errors";
import { ulid } from "ulid";
import { EventBusPort } from "../types/types";

export class CategoryService {
  constructor(
    private readonly categoryRepo: ChannelCategoryRepo,
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

    this.eventBus.publish(WSEventType.CATEGORY_CREATE, category);

    return category;
  }

  async deleteCategory(categoryId: string) {
    const category = await this.categoryRepo.getCategory(categoryId);
    if (!category) throw new NotFoundError("Category doesn't exist");

    const targetChannels = await this.channelRepo.getChannelsByCategory(
      categoryId
    );

    await this.categoryRepo.deleteCategory(categoryId);

    this.eventBus.publish(WSEventType.CATEGORY_DELETE, category);

    const updatedChannels = targetChannels.map((channel) => ({
      ...channel,
      categoryId: null,
    }));

    updatedChannels.forEach((updatedChannel) => {
      this.eventBus.publish(WSEventType.CHANNEL_UPDATE, updatedChannel);
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
    this.eventBus.publish(WSEventType.CATEGORY_UPDATE, updatedCategory);
  }
}
