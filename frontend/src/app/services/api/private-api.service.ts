import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api';
import { HttpClient } from '@angular/common/http';
import { filter, Observable, switchMap, take } from 'rxjs';
import {
  ChannelCategory,
  ChannelCreate,
  ChannelUpdate,
  Message,
  Server,
  ServerCreate,
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

  //Message CRUD
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

  //Users CRUD
  getCurrentUser(): Observable<User> {
    return this.authorisedFetch<User>((_) => this.get<User>('users/me'));
  }

  // getUserById(userId: string): Observable<User> {
  //   return this.authorisedFetch<User>((_) => this.get<User>(`users/${userId}`));
  // }

  //Channel CRUD
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

  //Channel Category CRUD
  getServerStructure(serverId: string): Observable<ChannelCategory[]> {
    return this.authorisedFetch<ChannelCategory[]>((_) =>
      this.get<ChannelCategory[]>(`servers/${serverId}/structure`)
    );
  }

  //Server CRUD
  getServers(): Observable<Server[]> {
    return this.authorisedFetch<Server[]>((_) => this.get<Server[]>('servers'));
  }

  createServer(newServerData: ServerCreate) {
    return this.authorisedFetch<Server>((_) =>
      this.post<Server>(`servers/`, newServerData)
    );
  }
}
