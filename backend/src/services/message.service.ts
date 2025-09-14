import {
  Message,
  MessageCreate,
  MessageUpdate,
  WSEventType,
} from "../../../common/types";
import { ChannelRepo } from "../db/repos/channel.repo";
import { MessageRepo } from "../db/repos/message.repo";
import { BadRequestError, NotFoundError } from "../errors/errors";
import { ulid } from "ulid";
import { EventBusPort } from "../types/types";

export class MessageService {
  constructor(
    private readonly messageRepo: MessageRepo,
    private readonly channelRepo: ChannelRepo,
    private readonly eventBus: EventBusPort
  ) {}

  async sendMessage(
    channelId: string,
    authorId: string,
    messageCreate: MessageCreate
  ) {
    const channel = await this.channelRepo.getChannel(channelId);

    if (!channel) throw new NotFoundError("Channel doesn't exist");

    if (!messageCreate) throw new BadRequestError("Message content required");

    const message: Message = {
      id: ulid(),
      channelId,
      authorId,
      content: messageCreate.content,
      createdAt: new Date().toISOString(),
    };

    await this.messageRepo.createMessage(message);

    this.eventBus.publish(WSEventType.MESSAGE_RECEIVE, message);

    return message;
  }

  async getMessages(channelId: string) {
    const channel = await this.channelRepo.getChannel(channelId);
    if (!channel) throw new NotFoundError("Channel doesn't exist");

    return await this.messageRepo.getMessagesByChannel(channelId);
  }

  async deleteMessage(messageId: string) {
    const message = await this.messageRepo.getMessage(messageId);
    if (!message) throw new NotFoundError("Message doesn't exist");

    //Broadcast to users
    this.eventBus.publish(WSEventType.MESSAGE_DELETE, message);

    await this.messageRepo.deleteMessage(messageId);
  }

  async editMessage(messageId: string, messageUpdate: MessageUpdate) {
    const message = await this.messageRepo.getMessage(messageId);
    if (!message) throw new NotFoundError("Message doesn't exist");

    await this.messageRepo.editMessage(messageId, messageUpdate.content);
    const newMessage = await this.messageRepo.getMessage(messageId);

    //Broadcast to users
    this.eventBus.publish(WSEventType.MESSAGE_EDIT, newMessage);
  }
}
