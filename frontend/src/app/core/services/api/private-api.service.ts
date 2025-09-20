import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api';
import { HttpClient } from '@angular/common/http';
import { filter, Observable, switchMap, take } from 'rxjs';
import {
  ChannelCategory,
  ChannelCategoryCreate,
  ChannelCategoryUpdate,
  ChannelCreate,
  ChannelUpdate,
  FriendRequest,
  FriendRequestCreate,
  FriendRequestUpdate,
  Message,
  CreateMessagePayload,
  UpdateMessagePayload,
  PresenceUpdate,
  Server,
  ServerCreate,
  ServerInvite,
  ServerInviteCreate,
  ServerInvitePreview,
  ServerUpdate,
  PublicUser,
  PrivateUser,
  UserUpdate,
} from '@common/types';
import { AuthTokenService } from '../auth-token/auth-token.service';
import { Channel } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class PrivateApiService extends BaseApiService {
  private tokenService = inject(AuthTokenService);

  constructor(http: HttpClient) {
    super(http, 'http://localhost:3000/api/private');
  }

  private authorisedFetch<T>(fetchFunction: () => Observable<T>): Observable<T> {
    return this.tokenService.token$.pipe(
      filter((token): token is string => !!token),
      take(1),
      switchMap((_) => fetchFunction()),
    );
  }

  //#region Message CRUD
  sendMessage(channelId: string, createPayload: CreateMessagePayload): Observable<Message> {
    return this.authorisedFetch<Message>(() =>
      this.post<Message>(`channels/${channelId}/messages`, createPayload),
    );
  }

  getMessageHistory(channelId: string): Observable<Message[]> {
    return this.authorisedFetch<Message[]>(() =>
      this.get<Message[]>(`channels/${channelId}/messages`),
    );
  }

  editMessage(messageId: string, updatePayload: UpdateMessagePayload): Observable<void> {
    return this.authorisedFetch<void>(() =>
      this.patch<void>(`messages/${messageId}`, updatePayload),
    );
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.authorisedFetch<void>(() => this.delete<void>(`messages/${messageId}`));
  }
  //#endregion

  //#region Users CRUD
  getCurrentUser(): Observable<PrivateUser> {
    return this.authorisedFetch<PrivateUser>(() => this.get<PrivateUser>('users/me'));
  }

  getUserById(userId: string): Observable<PublicUser> {
    return this.authorisedFetch<PublicUser>(() => this.get<PublicUser>(`users/${userId}`));
  }

  getServerUsers(serverId: string) {
    return this.authorisedFetch<PublicUser[]>(() =>
      this.get<PublicUser[]>(`servers/${serverId}/users`),
    );
  }

  updateUserSettings(userUpdate: UserUpdate): Observable<PrivateUser> {
    return this.authorisedFetch(() => this.patch<PrivateUser>(`users/me`, userUpdate));
  }

  //Temporary route
  getAllUsers() {
    return this.authorisedFetch<PublicUser[]>(() => this.get<PublicUser[]>(`users`));
  }
  //#endregion

  //#region Channel CRUD
  getServerChannels(serverId: string): Observable<Channel[]> {
    return this.authorisedFetch<Channel[]>(() =>
      this.get<Channel[]>(`servers/${serverId}/channels`),
    );
  }

  createChannel(serverId: string, channelCreate: ChannelCreate) {
    return this.authorisedFetch<Channel>(() =>
      this.post<Channel>(`servers/${serverId}/channels`, channelCreate),
    );
  }

  editChannel(channelId: string, channelUpdate: ChannelUpdate): Observable<void> {
    return this.authorisedFetch<void>(() =>
      this.patch<void>(`channels/${channelId}`, channelUpdate),
    );
  }

  deleteChannel(channelId: string) {
    return this.authorisedFetch<void>(() => this.delete<void>(`channels/${channelId}`));
  }
  //#endregion

  //#region Channel Category CRUD
  getServerStructure(serverId: string): Observable<ChannelCategory[]> {
    return this.authorisedFetch<ChannelCategory[]>(() =>
      this.get<ChannelCategory[]>(`servers/${serverId}/structure`),
    );
  }

  createCategory(
    serverId: string,
    categoryCreate: ChannelCategoryCreate,
  ): Observable<ChannelCategory> {
    return this.authorisedFetch<ChannelCategory>(() =>
      this.post<ChannelCategory>(`servers/${serverId}/categories`, categoryCreate),
    );
  }

  deleteCategory(categoryId: string) {
    return this.authorisedFetch<void>(() => this.delete<void>(`categories/${categoryId}`));
  }

  editCategory(categoryId: string, categoryUpdate: ChannelCategoryUpdate): Observable<void> {
    return this.authorisedFetch<void>(() =>
      this.patch<void>(`categories/${categoryId}`, categoryUpdate),
    );
  }
  //#endregion

  //#region Server CRUD
  getServers(): Observable<Server[]> {
    return this.authorisedFetch<Server[]>(() => this.get<Server[]>('servers'));
  }

  createServer(serverCreate: ServerCreate) {
    return this.authorisedFetch<Server>(() => this.post<Server>(`servers`, serverCreate));
  }

  deleteServer(serverId: string) {
    return this.authorisedFetch<void>(() => this.delete<void>(`servers/${serverId}`));
  }

  editServer(serverId: string, serverUpdate: ServerUpdate): Observable<void> {
    return this.authorisedFetch<void>(() => this.patch<void>(`servers/${serverId}`, serverUpdate));
  }
  //#endregion

  //#region Presence
  getServerUserPresences(serverId: string): Observable<PresenceUpdate[]> {
    return this.authorisedFetch<PresenceUpdate[]>(() =>
      this.get<PresenceUpdate[]>(`servers/${serverId}/presences`),
    );
  }

  getUserPresences(): Observable<PresenceUpdate[]> {
    return this.authorisedFetch(() => this.get<PresenceUpdate[]>(`users/presences`));
  }

  //#endregion

  //#region Friend Requests CRUD
  sendFriendRequest(requestCreate: FriendRequestCreate): Observable<FriendRequest> {
    return this.authorisedFetch<FriendRequest>(() =>
      this.post<FriendRequest>(`friend-requests`, requestCreate),
    );
  }

  getIncomingFriendRequests(): Observable<FriendRequest[]> {
    return this.authorisedFetch<FriendRequest[]>(() =>
      this.get<FriendRequest[]>(`friend-requests/incoming`),
    );
  }

  getOutgoingFriendRequests(): Observable<FriendRequest[]> {
    return this.authorisedFetch<FriendRequest[]>(() =>
      this.get<FriendRequest[]>(`friend-requests/outgoing`),
    );
  }

  updateFriendRequest(requestId: string, requestUpdate: FriendRequestUpdate): Observable<void> {
    return this.authorisedFetch<void>(() =>
      this.patch<void>(`friend-requests/${requestId}`, requestUpdate),
    );
  }

  cancelFriendRequest(requestId: string): Observable<void> {
    return this.authorisedFetch<void>(() => this.delete<void>(`friend-requests/${requestId}`));
  }
  //#endregion

  //#region Friends
  getFriends(): Observable<string[]> {
    return this.authorisedFetch<string[]>(() => this.get<string[]>(`users/me/friends`));
  }
  //#endregion

  //#region DMs
  getDMChannels(): Observable<Channel[]> {
    return this.authorisedFetch(() => this.get<Channel[]>('users/me/dms'));
  }

  //#endregion

  //#region Invites
  createInvite(inviteCreate: ServerInviteCreate): Observable<ServerInvite> {
    return this.authorisedFetch(() => this.post<ServerInvite>('invites', inviteCreate));
  }

  previewInvite(inviteLink: string): Observable<ServerInvitePreview> {
    return this.authorisedFetch(() => this.get<ServerInvitePreview>(`invites/${inviteLink}`));
  }

  acceptInvite(inviteLink: string): Observable<Server> {
    return this.authorisedFetch(() => this.post<Server>(`invites/${inviteLink}/accept`, {}));
  }

  revokeInvite(inviteLink: string): Observable<void> {
    return this.authorisedFetch(() => this.delete<void>(`invites/${inviteLink}`));
  }

  //#endregion
}
