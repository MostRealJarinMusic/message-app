import { NotFoundError } from "../errors/errors";
import { PrivateUser, UserUpdate, WSEventType } from "../../../common/types";
import { UserRepo } from "../db/repos/user.repo";
import { EventBusPort } from "../types/types";

export class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly eventBus: EventBusPort
  ) {}

  async getAllUsers() {
    const users = await this.userRepo.getAllUsers();
    return users;
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

    this.eventBus.publish(WSEventType.USER_UPDATE, updatedPublicUser);

    return updatedPrivateUser;
  }
}
