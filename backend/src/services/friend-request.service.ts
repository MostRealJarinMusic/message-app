import {
  Channel,
  ChannelType,
  FriendRequest,
  FriendRequestCreate,
  FriendRequestStatus,
  FriendRequestUpdate,
  WSEventType,
} from "../../../common/types";
import { ulid } from "ulid";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../errors/errors";
import { EventBusPort } from "../types/types";
import { FriendRequestRepo } from "../db/repos/friend-request.repo";
import { FriendRepo } from "../db/repos/friend.repo";
import { UserRepo } from "../db/repos/user.repo";
import { ChannelRepo } from "../db/repos/channel.repo";
import { DMChannelRepo } from "../db/repos/dm-channel.repo";

export class FriendRequestService {
  constructor(
    private readonly friendRequestRepo: FriendRequestRepo,
    private readonly friendRepo: FriendRepo,
    private readonly userRepo: UserRepo,
    private readonly channelRepo: ChannelRepo,
    private readonly dmChannelRepo: DMChannelRepo,
    private readonly eventBus: EventBusPort
  ) {}

  async sendFriendRequest(senderId: string, data: FriendRequestCreate) {
    if (!data) throw new BadRequestError("Friend request data required");

    const targetUser = await this.userRepo.getUserByUsername(
      data.targetUsername
    );

    if (!targetUser)
      throw new NotFoundError(
        `User with username ${data.targetUsername} doesn't exist`
      );

    if (targetUser.id === senderId)
      throw new BadRequestError("Cannot friend yourself");

    const existingRequest = await this.friendRequestRepo.requestExistsByUserIds(
      senderId,
      targetUser.id
    );

    if (existingRequest)
      throw new ConflictError("Friend request already exists");

    const friendRequest: FriendRequest = {
      id: ulid(),
      senderId,
      receiverId: targetUser.id,
      status: FriendRequestStatus.PENDING,
      createdAt: new Date().toISOString(),
    };

    await this.friendRequestRepo.createRequest(friendRequest);

    // //Notify sender
    this.eventBus.publish(WSEventType.FRIEND_REQUEST_SENT, friendRequest, [
      friendRequest.senderId,
    ]);

    //Notify requested user
    this.eventBus.publish(WSEventType.FRIEND_REQUEST_RECEIVE, friendRequest, [
      friendRequest.receiverId,
    ]);

    return friendRequest;
  }

  async getIncomingFriendRequests(userId: string) {
    const allRequests = await this.friendRequestRepo.getFriendRequestsForUser(
      userId
    );
    return allRequests.filter(
      (i) => i.receiverId === userId && i.status === FriendRequestStatus.PENDING
    );
  }

  async getOutgoingFriendRequests(userId: string) {
    const allRequests = await this.friendRequestRepo.getFriendRequestsForUser(
      userId
    );
    return allRequests.filter(
      (o) => o.senderId === userId && o.status === FriendRequestStatus.PENDING
    );
  }

  async updateFriendRequest(receiverId: string, update: FriendRequestUpdate) {
    //Accepting or rejecting friend requests
    const friendRequest = await this.friendRequestRepo.getFriendRequestById(
      update.id
    );

    if (!friendRequest) throw new NotFoundError("Friend request doesn't exist");

    if (friendRequest.senderId === receiverId)
      throw new BadRequestError("Cannot friend yourself");

    //Mark friend request with action
    await this.friendRequestRepo.updateFriendRequestStatus(update);
    const updated = await this.friendRequestRepo.getFriendRequestById(
      update.id
    );

    //Sender and receiver notification that request is updated - frontend will deal with UI update
    this.eventBus.publish(WSEventType.FRIEND_REQUEST_UPDATE, updated, [
      friendRequest.senderId,
      receiverId,
    ]);

    switch (updated.status) {
      case FriendRequestStatus.ACCEPTED:
        //Add friend
        await this.friendRepo.addFriend(friendRequest.senderId, receiverId);

        //Sender notification for new friend
        this.eventBus.publish(WSEventType.FRIEND_ADD, { id: receiverId }, [
          friendRequest.senderId,
        ]);

        //Receiver notification for new friend
        this.eventBus.publish(
          WSEventType.FRIEND_ADD,
          { id: friendRequest.senderId },
          [receiverId]
        );

        //Create the channel and direct message entry
        const channel: Channel = {
          id: ulid(),
          type: ChannelType.DM,
          name: "DM",
          participants: [friendRequest.senderId, receiverId],
        };

        await this.channelRepo.createChannel(channel);
        await this.dmChannelRepo.createDMChannel(channel, friendRequest);

        //Notification for channel creation
        this.eventBus.publish(WSEventType.DM_CHANNEL_CREATE, channel, [
          friendRequest.senderId,
          receiverId,
        ]);

        break;
      case FriendRequestStatus.REJECTED:
        //Update sent - just break here
        break;
      default:
        break;
    }
  }

  async deleteFriendRequest(userId: string, requestId: string) {
    const friendRequest = await this.friendRequestRepo.getFriendRequestById(
      requestId
    );

    if (!friendRequest) throw new NotFoundError("Request doesn't exist");

    if (friendRequest.senderId !== userId)
      throw new BadRequestError(
        "Incorrect permissions to delete friend request"
      );

    await this.friendRequestRepo.deleteFriendRequest(requestId);

    this.eventBus.publish(WSEventType.FRIEND_REQUEST_DELETE, friendRequest, [
      friendRequest.senderId,
      friendRequest.receiverId,
    ]);
  }
}
