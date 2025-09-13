import { FriendRepo } from "../db/repos/friend.repo";

export class FriendService {
  constructor(private readonly friendRepo: FriendRepo) {}

  async getFriendIds(userId: string) {
    //Check if user exists?

    const allFriendIds = await this.friendRepo.getFriends(userId);
    return allFriendIds;
  }

  static async blockFriend(userId: string, blockedId: string) {}

  static async removeFriend(userId: string, removeId: string) {}
}
