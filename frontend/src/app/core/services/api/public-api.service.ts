import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api';
import { HttpClient } from '@angular/common/http';
import { AuthPayload, LoginCredentials, RegisterPayload, Token } from '@common/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicApiService extends BaseApiService {
  constructor(http: HttpClient) {
    super(http, 'http://localhost:3000/api/public');
  }

  login(credentials: LoginCredentials): Observable<AuthPayload> {
    return this.post<AuthPayload>('auth/login', credentials, { withCredentials: true });
  }

  register(payload: RegisterPayload): Observable<AuthPayload> {
    return this.post<AuthPayload>('auth/register', payload, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.post<void>('auth/logout', {}, { withCredentials: true });
  }

  refresh(): Observable<{ token: Token }> {
    return this.post<{ token: Token }>('auth/refresh', {}, { withCredentials: true });
  }
}
