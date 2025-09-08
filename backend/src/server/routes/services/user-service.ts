import { UserRepo } from "../../../db/repos/user.repo";
import { WebSocketManager } from "../../ws/websocket-manager";
import { NotFoundError } from "../../../errors/errors";

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
}
