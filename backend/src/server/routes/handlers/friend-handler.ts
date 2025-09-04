import { FriendRepo } from "../../../db/repos/friend.repo";

export class FriendHandler {
  static async getFriends(userId: string) {
    //Check if user exists?

    const allFriendIds = await FriendRepo.getFriends(userId);
    return allFriendIds;
  }

  static async blockFriend(userId: string, blockedId: string) {}

  static async removeFriend(userId: string, removeId: string) {}
}
