import { FriendRequestRepo } from "db/repos/friend-request.repo";
import { Request, Response } from "express";
import { WebSocketManager } from "server/ws/websocket-manager";
import { SignedRequest } from "types/types";

export class FriendRequestHandler {
  static async sendFriendRequest(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {}

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
  ) {}

  static async rejectRequest(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {}

  static async cancelRequest(
    req: SignedRequest,
    res: Response,
    wsManager: WebSocketManager
  ) {}
}
