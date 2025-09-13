import { TypingIndicator, WSEventType } from "@common/types";
import { ChannelRepo } from "../db/repos/channel.repo";
import { EventBusPort } from "../types/types";
import { NotFoundError } from "../errors/errors";
import { RelevanceService } from "./relevance.service";

export class TypingService {
  constructor(
    private readonly channelRepo: ChannelRepo,
    private readonly relevanceService: RelevanceService,
    private readonly publisher: EventBusPort
  ) {}

  async startTyping(userId: string, channelId: string) {
    const channel = await this.channelRepo.getChannel(channelId);
    if (!channel) throw new NotFoundError("Channel doesn't exist");

    const memberIds = await this.relevanceService.getTargetIdsForChannel(
      channel.id
    );

    const indicator: TypingIndicator = {
      userId,
      channelId,
    };

    this.publisher.publish(
      WSEventType.TYPING_START,
      indicator,
      memberIds.filter((id) => id !== userId)
    );
  }

  async stopTyping(userId: string, channelId: string) {
    const channel = await this.channelRepo.getChannel(channelId);
    if (!channel) throw new NotFoundError("Channel doesn't exist");

    const memberIds = await this.relevanceService.getTargetIdsForChannel(
      channel.id
    );

    const indicator: TypingIndicator = {
      userId,
      channelId,
    };

    this.publisher.publish(
      WSEventType.TYPING_STOP,
      indicator,
      memberIds.filter((id) => id !== userId)
    );
  }
}
