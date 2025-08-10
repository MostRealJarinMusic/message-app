import {
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

export class FriendRequestHandler {
  static async sendFriendRequest(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const userId = req.signature.id;
      const newRequestData = req.body as FriendRequestCreate;

      //Check if both users exist???
      if (!newRequestData || newRequestData.targetId !== userId) {
        res.status(400).json({ error: "Friend request data required" });
        return;
      }

      const friendRequest: FriendRequest = {
        id: ulid(),
        senderId: userId,
        receiverId: newRequestData.targetId,
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
      const userId = req.signature.id;

      const allRequests = await FriendRequestRepo.getFriendRequestsForUser(
        userId
      );
      const incomingRequests = allRequests.filter(
        (i) => i.receiverId === userId
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
      const userId = req.signature.id;

      const allRequests = await FriendRequestRepo.getFriendRequestsForUser(
        userId
      );
      const outgoingRequests = allRequests.filter((o) => o.senderId === userId);

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
      const receiverId = req.signature.id;
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
        friendRequest,
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
      const userId = req.signature.id;
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
      res.status(500).json({ error: "Failed to delete friend request" });
    }
  }

  /*
  static async acceptRequest(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {
    //If you are accepting a friend request, the HTTP request came from the receiver
    //Therefore, the param id should be the sender's ID
    try {
      const receiverId = req.signature.id;
      const senderId = req.params.senderId;

      if (receiverId === senderId) {
        res.status(400).json({ error: "Cannot friend yourself" });
        return;
      }

      //Check if user exists
      const senderExists = await UserRepo.userExists(senderId);
      if (!senderExists) {
        res.status(404).json({ error: "Sender no longer exists" });
        return;
      }

      //Check if request exists
      const friendRequest = await FriendRequestRepo.getFriendRequest(
        senderId,
        receiverId
      );
      if (!friendRequest) {
        res.status(404).json({ error: "Friend request no longer exists" });
        return;
      }

      //Delete friend request and add friendship
      await FriendRequestRepo.deleteFriendRequest(senderId, receiverId);
      await FriendRepo.addFriend(senderId, receiverId);

      //WebSocket messages
      //Sender notification that request is accepted
      wsManager.broadcastToUser(
        WSEventType.FRIEND_REQUEST_ACCEPTED,
        friendRequest,
        senderId
      );

      //Sender notification for new friend
      wsManager.broadcastToUser(
        WSEventType.FRIEND_ADD,
        { id: receiverId },
        senderId
      );

      //Receiver notification that request is accepted
      wsManager.broadcastToUser(
        WSEventType.FRIEND_REQUEST_ACCEPT,
        friendRequest,
        receiverId
      );

      //Receiver notification for new friend
      wsManager.broadcastToUser(
        WSEventType.FRIEND_ADD,
        { id: senderId },
        receiverId
      );

      //JSON response
      res.json(friendRequest);
    } catch (err) {
      res.status(500).json({ error: "Failed to accept friend request" });
    }
  }

  static async rejectRequest(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const receiverId = req.signature.id;
      const senderId = req.params.senderId;

      if (receiverId === senderId) {
        res.status(400).json({ error: "Cannot friend yourself" });
        return;
      }

      //Check if user exists
      const senderExists = await UserRepo.userExists(senderId);
      if (!senderExists) {
        res.status(404).json({ error: "Sender no longer exists" });
        return;
      }

      //Check if request exists
      const friendRequest = await FriendRequestRepo.getFriendRequest(
        senderId,
        receiverId
      );
      if (!friendRequest) {
        res.status(404).json({ error: "Friend request no longer exists" });
        return;
      }

      //Delete friend request
      await FriendRequestRepo.deleteFriendRequest(senderId, receiverId);

      //WebSocket messages
      //Sender notification that request is rejected
      wsManager.broadcastToUser(
        WSEventType.FRIEND_REQUEST_REJECTED,
        friendRequest,
        senderId
      );

      //Receiver notification that request is rejected
      wsManager.broadcastToUser(
        WSEventType.FRIEND_REQUEST_REJECT,
        friendRequest,
        receiverId
      );

      //JSON response
      res.json(friendRequest);
    } catch (err) {
      res.status(500).json({ error: "Failed to reject friend request" });
    }
  }

  static async cancelRequest(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const senderId = req.signature.id;
      const receiverId = req.params.receiverId;

      if (receiverId === senderId) {
        res.status(400).json({ error: "Cannot friend yourself" });
        return;
      }

      //Check if user exists
      const receiverExists = await UserRepo.userExists(receiverId);
      if (!receiverExists) {
        res.status(404).json({ error: "Sender no longer exists" });
        return;
      }

      //Check if request exists
      const friendRequest = await FriendRequestRepo.getFriendRequest(
        senderId,
        receiverId
      );
      if (!friendRequest) {
        res.status(404).json({ error: "Friend request no longer exists" });
        return;
      }

      //Delete friend request
      await FriendRequestRepo.deleteFriendRequest(senderId, receiverId);

      //WebSocket messages
      //Sender notification that request is cancelled
      wsManager.broadcastToUser(
        WSEventType.FRIEND_REQUEST_CANCEL,
        friendRequest,
        senderId
      );

      //Receiver notification that request is cancelled
      wsManager.broadcastToUser(
        WSEventType.FRIEND_REQUEST_CANCELLED,
        friendRequest,
        receiverId
      );

      //JSON response
      res.json(friendRequest);
    } catch (err) {
      res.status(500).json({ error: "Failed to cancel friend request" });
    }
  }
    */
}
