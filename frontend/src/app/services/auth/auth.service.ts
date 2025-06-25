import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthTokenService } from '../authtoken/authtoken.service';
import { AuthPayload, LoginCredentials, RegisterPayload, User } from '@common/types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apiService: ApiService, private tokenService: AuthTokenService) {
    this.tokenService.clearToken();
  }

  async register(payload: RegisterPayload): Promise<boolean> {
    const data = await firstValueFrom(this.apiService.publicPost<AuthPayload>('auth/register', payload));
    if (data && data.token) {
      this.tokenService.setToken(data.token);
      return true;
    }
    return false;
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    const data = await firstValueFrom(this.apiService.publicPost<AuthPayload>('auth/login', credentials));
    if (data && data.token) {
      this.tokenService.setToken(data.token);
      return true;
    }
    return false;
  }

  logout(): void {
    this.tokenService.clearToken();
  }
}
