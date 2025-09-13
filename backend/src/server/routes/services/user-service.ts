import { UserRepo } from "../../../db/repos/user.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import { InternalServerError, NotFoundError } from "../../../errors/errors";
import {
  PrivateUser,
  UserUpdate,
  WSEventType,
} from "../../../../../common/types";
import { RelevanceService } from "./relevance-service";

export class UserService {
  static async getAllUsers() {
    const users = await UserRepo.getAllUsers();
    return users;
  }

  static async getAllUserPresences(wsManager: WebSocketManager) {
    const users = await UserRepo.getAllUsers();
    const userIds = users.map((u) => u.id);

    const presences = wsManager.getPresenceSnapshot(userIds);

    return presences;
  }

  static async getUserById(userId: string) {
    const user = await UserRepo.getUserById(userId);
    if (!user) throw new NotFoundError("User doesn't exist");
    return user;
  }

  static async getMe(userId: string) {
    const user = await UserRepo.getMe(userId);
    if (!user) throw new NotFoundError("User doesn't exist");
    return user;
  }

  static async updateUserSettings(
    userId: string,
    userUpdate: UserUpdate,
    wsManager: WebSocketManager
  ) {
    const user = await UserService.getMe(userId);

    const proposedUser = {
      ...user,
      ...userUpdate,
    } as PrivateUser;

    await UserRepo.updateUser(proposedUser);
    const updatedPrivateUser = await UserRepo.getMe(userId);
    const updatedPublicUser = await UserRepo.getUserById(userId);

    if (!updatedPublicUser)
      throw new InternalServerError("Failed to update user settings");

    //Broadcast to all relevant users - clients with the same user, friends of the user, users in the same servers
    const relevantIds = await RelevanceService.getRelevantUserIds(userId);

    wsManager.broadcastToGroup(
      WSEventType.USER_UPDATE,
      updatedPublicUser,
      relevantIds.filter((id) => id !== userId) //No WebSocket messages to yourself
    );

    return updatedPrivateUser;
  }
}
