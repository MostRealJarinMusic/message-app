import {
  Channel,
  ChannelType,
  FriendRequest,
  FriendRequestCreate,
  FriendRequestStatus,
  FriendRequestUpdate,
  WSEventType,
} from "../../../../../common/types";
import { FriendRequestRepo } from "../../../db/repos/friend-request.repo";
import { FriendRepo } from "../../../db/repos/friend.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import { ulid } from "ulid";
import { UserRepo } from "../../../db/repos/user.repo";
import { ChannelRepo } from "../../../db/repos/channel.repo";
import { DMChannelRepo } from "../../../db/repos/dm-channel.repo";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../../errors/errors";

export class FriendRequestHandler {
  static async sendFriendRequest(
    senderId: string,
    data: FriendRequestCreate,
    wsManager: WebSocketManager
  ) {
    if (!data) throw new BadRequestError("Friend request data required");

    const targetUser = await UserRepo.getUserByUsername(data.targetUsername);

    if (!targetUser)
      throw new NotFoundError(
        `User with username ${data.targetUsername} doesn't exist`
      );

    if (targetUser.id === senderId)
      throw new BadRequestError("Cannot friend yourself");

    const existingRequest = await FriendRequestRepo.requestExistsByUserIds(
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

    await FriendRequestRepo.createRequest(friendRequest);

    // //Notify sender
    wsManager.broadcastToUser(
      WSEventType.FRIEND_REQUEST_SENT,
      friendRequest,
      friendRequest.senderId
    );

    //Notify requested user
    wsManager.broadcastToUser(
      WSEventType.FRIEND_REQUEST_RECEIVE,
      friendRequest,
      friendRequest.receiverId
    );

    return friendRequest;
  }

  static async getIncomingFriendRequests(userId: string) {
    const allRequests = await FriendRequestRepo.getFriendRequestsForUser(
      userId
    );
    return allRequests.filter(
      (i) => i.receiverId === userId && i.status === FriendRequestStatus.PENDING
    );
  }

  static async getOutgoingFriendRequests(userId: string) {
    const allRequests = await FriendRequestRepo.getFriendRequestsForUser(
      userId
    );
    return allRequests.filter(
      (o) => o.senderId === userId && o.status === FriendRequestStatus.PENDING
    );
  }

  static async updateFriendRequest(
    receiverId: string,
    update: FriendRequestUpdate,
    wsManager: WebSocketManager
  ) {
    //Accepting or rejecting friend requests
    const friendRequest = await FriendRequestRepo.getFriendRequestById(
      update.id
    );

    if (!friendRequest) throw new NotFoundError("Friend request doesn't exist");

    if (friendRequest.senderId === receiverId)
      throw new BadRequestError("Cannot friend yourself");

    //Mark friend request with action
    await FriendRequestRepo.updateFriendRequestStatus(update);
    const updated = await FriendRequestRepo.getFriendRequestById(update.id);

    //Sender and receiver notification that request is updated - frontend will deal with UI update
    wsManager.broadcastToGroup(WSEventType.FRIEND_REQUEST_UPDATE, updated, [
      friendRequest.senderId,
      receiverId,
    ]);

    switch (updated.status) {
      case FriendRequestStatus.ACCEPTED:
        //Add friend
        await FriendRepo.addFriend(friendRequest.senderId, receiverId);

        //Sender notification for new friend
        wsManager.broadcastToUser(
          WSEventType.FRIEND_ADD,
          { id: receiverId },
          friendRequest.senderId
        );

        //Receiver notification for new friend
        wsManager.broadcastToUser(
          WSEventType.FRIEND_ADD,
          { id: friendRequest.senderId },
          receiverId
        );

        //Create the channel and direct message entry
        const channel: Channel = {
          id: ulid(),
          type: ChannelType.DM,
          name: "DM",
          participants: [friendRequest.senderId, receiverId],
        };

        await ChannelRepo.createChannel(channel);
        await DMChannelRepo.createDMChannel(channel, friendRequest);

        //Notification for channel creation
        wsManager.broadcastToGroup(WSEventType.DM_CHANNEL_CREATE, channel, [
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

  static async deleteFriendRequest(
    userId: string,
    requestId: string,
    wsManager: WebSocketManager
  ) {
    const friendRequest = await FriendRequestRepo.getFriendRequestById(
      requestId
    );

    if (!friendRequest) throw new NotFoundError("Request doesn't exist");

    if (friendRequest.senderId !== userId)
      throw new BadRequestError(
        "Incorrect permissions to delete friend request"
      );

    await FriendRequestRepo.deleteFriendRequest(requestId);

    wsManager.broadcastToGroup(
      WSEventType.FRIEND_REQUEST_DELETE,
      friendRequest,
      [friendRequest.senderId, friendRequest.receiverId]
    );
  }
}
