import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api';
import { HttpClient } from '@angular/common/http';
import { filter, Observable, switchMap, take } from 'rxjs';
import { Message, User } from '@common/types';
import { AuthTokenService } from '../authtoken/auth-token.service';

@Injectable({
  providedIn: 'root'
})
export class PrivateApiService extends BaseApiService {

  constructor(http: HttpClient, private tokenService: AuthTokenService) {
    super(http, 'http://localhost:3000/api/private')
  }

  private authFetch<T>(fetchFn: (token: string) => Observable<T>): Observable<T> {
    return this.tokenService.token$.pipe(
      filter((token): token is string => !!token),
      take(1),
      switchMap(token => fetchFn(token))
    )
  }

  getMessageHistory(): Observable<Message[]> {
    return this.authFetch<Message[]>(_ => this.get<Message[]>('messages'));
  }

  getCurrentUser(): Observable<User> {
    return this.authFetch<User>(_ => this.get<User>('auth/me'));
  }
}
