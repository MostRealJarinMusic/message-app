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
  PresenceUpdate,
  Server,
  ServerCreate,
  ServerUpdate,
  User,
} from '@common/types';
import { AuthTokenService } from '../authtoken/auth-token.service';
import { Channel } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class PrivateApiService extends BaseApiService {
  private tokenService = inject(AuthTokenService);

  constructor(http: HttpClient) {
    super(http, 'http://localhost:3000/api/private');
  }

  private authorisedFetch<T>(
    fetchFunction: (token: string) => Observable<T>
  ): Observable<T> {
    return this.tokenService.token$.pipe(
      filter((token): token is string => !!token),
      take(1),
      switchMap((token) => fetchFunction(token))
    );
  }

  //#region Message CRUD
  sendMessage(channelId: string, content: string): Observable<Message> {
    return this.authorisedFetch<Message>((_) =>
      this.post<Message>(`channels/${channelId}/messages`, { content })
    );
  }

  getMessageHistory(channelId: string): Observable<Message[]> {
    return this.authorisedFetch<Message[]>((_) =>
      this.get<Message[]>(`channels/${channelId}/messages`)
    );
  }

  editMessage(messageId: string, content: string): Observable<void> {
    return this.authorisedFetch<void>((_) =>
      this.patch<void>(`messages/${messageId}`, { content })
    );
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.authorisedFetch<void>((_) =>
      this.delete<void>(`messages/${messageId}`)
    );
  }
  //#endregion

  //#region Users CRUD
  getCurrentUser(): Observable<User> {
    return this.authorisedFetch<User>((_) => this.get<User>('users/me'));
  }

  getUserById(userId: string): Observable<User> {
    return this.authorisedFetch<User>((_) => this.get<User>(`users/${userId}`));
  }

  getServerUsers(serverId: string) {
    return this.authorisedFetch<User[]>((_) =>
      this.get<User[]>(`servers/${serverId}/users`)
    );
  }
  //#endregion

  //#region Channel CRUD
  getChannels(serverId: string): Observable<Channel[]> {
    return this.authorisedFetch<Channel[]>((_) =>
      this.get<Channel[]>(`servers/${serverId}/channels`)
    );
  }

  createChannel(serverId: string, newChannelData: ChannelCreate) {
    console.log(newChannelData);
    return this.authorisedFetch<Channel>((_) =>
      this.post<Channel>(`servers/${serverId}/channels`, newChannelData)
    );
  }

  editChannel(
    channelId: string,
    channelUpdate: ChannelUpdate
  ): Observable<void> {
    return this.authorisedFetch<void>((_) =>
      this.patch<void>(`channels/${channelId}`, { channelUpdate })
    );
  }

  deleteChannel(channelId: string) {
    return this.authorisedFetch<void>((_) =>
      this.delete<void>(`channels/${channelId}`)
    );
  }
  //#endregion

  //#region Channel Category CRUD
  getServerStructure(serverId: string): Observable<ChannelCategory[]> {
    return this.authorisedFetch<ChannelCategory[]>((_) =>
      this.get<ChannelCategory[]>(`servers/${serverId}/structure`)
    );
  }

  createCategory(
    serverId: string,
    newCategoryData: ChannelCategoryCreate
  ): Observable<ChannelCategory> {
    return this.authorisedFetch<ChannelCategory>((_) =>
      this.post<ChannelCategory>(
        `servers/${serverId}/categories`,
        newCategoryData
      )
    );
  }

  deleteCategory(categoryId: string) {
    return this.authorisedFetch<void>((_) =>
      this.delete<void>(`categories/${categoryId}`)
    );
  }

  editCategory(
    categoryId: string,
    categoryUpdate: ChannelCategoryUpdate
  ): Observable<void> {
    return this.authorisedFetch<void>((_) =>
      this.patch<void>(`categories/${categoryId}`, { categoryUpdate })
    );
  }
  //#endregion

  //#region Server CRUD
  getServers(): Observable<Server[]> {
    return this.authorisedFetch<Server[]>((_) => this.get<Server[]>('servers'));
  }

  createServer(newServerData: ServerCreate) {
    return this.authorisedFetch<Server>((_) =>
      this.post<Server>(`servers`, newServerData)
    );
  }

  deleteServer(serverId: string) {
    return this.authorisedFetch<void>((_) =>
      this.delete<void>(`servers/${serverId}`)
    );
  }

  editServer(serverId: string, serverUpdate: ServerUpdate): Observable<void> {
    return this.authorisedFetch<void>((_) =>
      this.patch<void>(`servers/${serverId}`, { serverUpdate })
    );
  }
  //#endregion

  //#region Presence
  getServerUserPresences(serverId: string): Observable<PresenceUpdate[]> {
    return this.authorisedFetch<PresenceUpdate[]>((_) =>
      this.get<PresenceUpdate[]>(`servers/${serverId}/presences`)
    );
  }

  //#endregion

  //#region Friend Requests CRUD
  sendFriendRequest(
    newFriendRequest: FriendRequestCreate
  ): Observable<FriendRequest> {
    return this.authorisedFetch<FriendRequest>((_) =>
      this.post<FriendRequest>(`friend-requests`, newFriendRequest)
    );
  }

  getIncomingFriendRequests(): Observable<FriendRequest[]> {
    return this.authorisedFetch<FriendRequest[]>((_) =>
      this.get<FriendRequest[]>(`friend-requests/incoming`)
    );
  }

  getOutgoingFriendRequests(): Observable<FriendRequest[]> {
    return this.authorisedFetch<FriendRequest[]>((_) =>
      this.get<FriendRequest[]>(`friend-requests/outgoing`)
    );
  }

  updateFriendRequest(
    requestId: string,
    requestUpdate: FriendRequestUpdate
  ): Observable<void> {
    return this.authorisedFetch<void>((_) =>
      this.patch<void>(`friend-requests/${requestId}`, requestUpdate)
    );
  }

  cancelFriendRequest(requestId: string): Observable<void> {
    return this.authorisedFetch<void>((_) =>
      this.delete<void>(`friend-requests/${requestId}`)
    );
  }
  //#endregion

  //#region Friends
  getFriends(): Observable<string[]> {
    return this.authorisedFetch<string[]>((_) => this.get<string[]>(`friends`));
  }

  //#endregion
}
