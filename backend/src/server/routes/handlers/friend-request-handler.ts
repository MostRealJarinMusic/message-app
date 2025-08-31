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
import { Response } from "express";
import { WebSocketManager } from "../../ws/websocket-manager";
import { SignedRequest } from "../../../types/types";
import { ulid } from "ulid";
import { UserRepo } from "../../../db/repos/user.repo";
import { ChannelRepo } from "../../../db/repos/channel.repo";
import { DMChannelRepo } from "../../../db/repos/dm-channel.repo";

export class FriendRequestHandler {
  static async sendFriendRequest(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const userId = req.signature!.id;
      const newRequestData = req.body as FriendRequestCreate;

      if (!newRequestData) {
        res.status(400).json({ error: "Friend request data required" });
        return;
      }

      const targetUser = await UserRepo.getUserByUsername(
        newRequestData.targetUsername
      );

      if (!targetUser) {
        res.status(404).json({
          error: `User with username ${newRequestData.targetUsername} doesn't exist`,
        });
        return;
      }

      if (targetUser.id === userId) {
        res.status(404).json({ error: "Cannot friend yourself" });
        return;
      }

      const existingRequest = await FriendRequestRepo.requestExistsByUserIds(
        userId,
        targetUser.id
      );

      if (existingRequest) {
        res.status(409).json({ error: "Friend request already exists" });
        return;
      }

      const friendRequest: FriendRequest = {
        id: ulid(),
        senderId: userId,
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

      res.status(201).json(friendRequest);
    } catch (err) {
      res.status(500).json({ error: "Failed to create friend request" });
    }
  }

  static async getIncomingFriendRequests(req: SignedRequest, res: Response) {
    try {
      const userId = req.signature!.id;

      const allRequests = await FriendRequestRepo.getFriendRequestsForUser(
        userId
      );
      const incomingRequests = allRequests.filter(
        (i) =>
          i.receiverId === userId && i.status === FriendRequestStatus.PENDING
      );

      res.json(incomingRequests);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to fetch incoming friend requests" });
    }
  }

  static async getOutgoingFriendRequests(req: SignedRequest, res: Response) {
    try {
      const userId = req.signature!.id;

      const allRequests = await FriendRequestRepo.getFriendRequestsForUser(
        userId
      );
      const outgoingRequests = allRequests.filter(
        (o) => o.senderId === userId && o.status === FriendRequestStatus.PENDING
      );

      res.json(outgoingRequests);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to fetch outgoing friend requests" });
    }
  }

  static async updateFriendRequest(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {
    //Accepting or rejecting friend requests
    try {
      const receiverId = req.signature!.id;
      const requestId = req.params.requestId;
      const friendRequestUpdate = req.body as FriendRequestUpdate;

      if (requestId !== friendRequestUpdate.id) {
        res.status(400).json({ error: "Request IDs do not match update" });
        return;
      }

      const friendRequest = await FriendRequestRepo.getFriendRequestById(
        requestId
      );
      const senderId = friendRequest.senderId;

      if (!friendRequest) {
        res.status(400).json({ error: "Friend request doesn't exist" });
        return;
      }

      if (senderId === receiverId) {
        res.status(400).json({ error: "Cannot friend yourself" });
        return;
      }

      //Mark friend request with action
      await FriendRequestRepo.updateFriendRequestStatus(friendRequestUpdate);
      const updatedFriendRequest = await FriendRequestRepo.getFriendRequestById(
        requestId
      );

      //Sender and receiver notification that request is updated - frontend will deal with UI update
      wsManager.broadcastToGroup(
        WSEventType.FRIEND_REQUEST_UPDATE,
        updatedFriendRequest,
        [senderId, receiverId]
      );

      switch (updatedFriendRequest.status) {
        case FriendRequestStatus.ACCEPTED:
          //Add friend
          await FriendRepo.addFriend(senderId, receiverId);

          //Sender notification for new friend
          wsManager.broadcastToUser(
            WSEventType.FRIEND_ADD,
            { id: receiverId },
            senderId
          );

          //Receiver notification for new friend
          wsManager.broadcastToUser(
            WSEventType.FRIEND_ADD,
            { id: senderId },
            receiverId
          );

          //Create the channel and direct message entry
          const channel: Channel = {
            id: ulid(),
            type: ChannelType.DM,
            name: "DM",
            participants: [senderId, receiverId],
          };

          await ChannelRepo.createChannel(channel);
          await DMChannelRepo.createDMChannel(channel, friendRequest);

          //Notification for channel creation
          wsManager.broadcastToGroup(WSEventType.DM_CHANNEL_CREATE, channel, [
            senderId,
            receiverId,
          ]);

          break;
        case FriendRequestStatus.REJECTED:
          //Update sent - just break here
          break;
        default:
          break;
      }

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to update friend request" });
    }
  }

  static async deleteFriendRequest(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const userId = req.signature!.id;
      const requestId = req.params.requestId;
      const friendRequest = await FriendRequestRepo.getFriendRequestById(
        requestId
      );

      if (!friendRequest) {
        res.status(404).json({ error: "Request doesn't exist" });
        return;
      }

      if (friendRequest.senderId !== userId) {
        res
          .status(400)
          .json({ error: "Incorrect permissions to delete friend request" });
        return;
      }

      await FriendRequestRepo.deleteFriendRequest(requestId);

      wsManager.broadcastToGroup(
        WSEventType.FRIEND_REQUEST_DELETE,
        friendRequest,
        [friendRequest.senderId, friendRequest.receiverId]
      );

      res.status(204).send();
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to delete friend request" });
    }
  }
}
