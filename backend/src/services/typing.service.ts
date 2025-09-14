import { TypingIndicator, WSEventType } from "../../../common/types";
import { ChannelRepo } from "../db/repos/channel.repo";
import { EventBusPort } from "../types/types";
import { NotFoundError } from "../errors/errors";

export class TypingService {
  constructor(
    private readonly channelRepo: ChannelRepo,
    private readonly eventBus: EventBusPort
  ) {}

  async startTyping(indicator: TypingIndicator) {
    const channel = await this.channelRepo.getChannel(indicator.channelId);
    if (!channel) throw new NotFoundError("Channel doesn't exist");

    this.eventBus.publish(WSEventType.TYPING_START, indicator);
  }

  async stopTyping(indicator: TypingIndicator) {
    const channel = await this.channelRepo.getChannel(indicator.channelId);
    if (!channel) throw new NotFoundError("Channel doesn't exist");

    this.eventBus.publish(WSEventType.TYPING_STOP, indicator);
  }
}
