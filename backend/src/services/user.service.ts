import { InternalServerError, NotFoundError } from "../errors/errors";
import { PrivateUser, UserUpdate, WSEventType } from "../../../common/types";
import { RelevanceService } from "./relevance.service";
import { UserRepo } from "../db/repos/user.repo";
import { EventBusPort, PresencePort } from "../types/types";

export class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly relevanceService: RelevanceService,
    private readonly eventBus: EventBusPort,
    private readonly presenceManager: PresencePort
  ) {}

  async getAllUsers() {
    const users = await this.userRepo.getAllUsers();
    return users;
  }

  async getAllUserPresences() {
    const users = await this.userRepo.getAllUsers();
    const userIds = users.map((u) => u.id);

    const presences = await this.presenceManager.getSnapshot(userIds);

    return presences;
  }

  async getUserById(userId: string) {
    const user = await this.userRepo.getUserById(userId);
    if (!user) throw new NotFoundError("User doesn't exist");
    return user;
  }

  async getMe(userId: string) {
    const user = await this.userRepo.getMe(userId);
    if (!user) throw new NotFoundError("User doesn't exist");
    return user;
  }

  async updateUserSettings(userId: string, userUpdate: UserUpdate) {
    const user = await this.getMe(userId);

    const proposedUser = {
      ...user,
      ...userUpdate,
    } as PrivateUser;

    await this.userRepo.updateUser(proposedUser);
    const updatedPrivateUser = await this.getMe(userId);
    const updatedPublicUser = await this.getUserById(userId);

    //Broadcast to all relevant users - clients with the same user, friends of the user, users in the same servers
    const relevantIds = await this.relevanceService.getRelevantUserIds(userId);

    this.eventBus.publish(
      WSEventType.USER_UPDATE,
      updatedPublicUser,
      relevantIds.filter((id) => id !== userId) //No WebSocket messages to yourself
    );

    return updatedPrivateUser;
  }
}
