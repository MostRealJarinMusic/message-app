import { FriendRequest, WSEventType } from "../../../../../common/types";
import { FriendRequestRepo } from "../../../db/repos/friend-request.repo";
import { FriendRepo } from "../../../db/repos/friend.repo";
import { UserRepo } from "../../../db/repos/user.repo";
import { Request, Response } from "express";
import { WebSocketManager } from "../../ws/websocket-manager";
import { SignedRequest } from "../../../types/types";

export class FriendRequestHandler {
  static async sendFriendRequest(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {
    try {
      const userId = req.signature.id;
      const friendRequest = req.body as FriendRequest;

      //Check if both users exist???
      if (!friendRequest || friendRequest.senderId !== userId) {
        res.status(400).json({ error: "Friend request data required" });
        return;
      }

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

  static async getIncomingRequests(req: SignedRequest, res: Response) {
    try {
      const userId = req.signature.id;

      const allRequests = await FriendRequestRepo.getFriendRequests(userId);
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

  static async getOutgoingRequests(req: SignedRequest, res: Response) {
    try {
      const userId = req.signature.id;

      const allRequests = await FriendRequestRepo.getFriendRequests(userId);
      const outgoingRequests = allRequests.filter((o) => o.senderId === userId);

      res.json(outgoingRequests);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to fetch outgoing friend requests" });
    }
  }

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
}
