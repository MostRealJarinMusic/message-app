import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { ApiService } from '../api/api.service';
import { firstValueFrom } from 'rxjs';
import { AuthtokenService } from '../authtoken/authtoken.service';
import { AuthPayload, LoginCredentials, RegisterPayload, User } from '@common/types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user!: User;

  constructor(private apiService: ApiService, private tokenService: AuthtokenService) {}

  async register(payload: RegisterPayload): Promise<boolean> {
    const data = await firstValueFrom(this.apiService.post<AuthPayload>('auth/register', payload));
    if (data) {
      this.tokenService.setToken(data.token);
      this.user = data.user;
      return true;
    }
    return false;
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    const data = await firstValueFrom(this.apiService.post<AuthPayload>('auth/login', credentials));
    if (data) {
      this.tokenService.setToken(data.token);
      this.user = data.user;
      return true;
    }
    return false;
  }

  logout(): void {

  }

  getUsername(): string {
    return this.user.username;
  }
}
