import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { ApiService } from '../api/api.service';
import { firstValueFrom } from 'rxjs';
import { AuthtokenService } from '../authtoken/authtoken.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apiService: ApiService, private tokenService: AuthtokenService) {}

  // register(username: string, password: string): Promise<boolean> {
  // }

  async login(username: string, password: string): Promise<boolean> {
    const data = await firstValueFrom(this.apiService.post<{ token: string }>('auth/login', { username, password }));
    if (data && data.token) {
      //localStorage.setItem(this.tokenKey, data.token);
      this.tokenService.setToken(data.token);
      return true;
    }
    return false;
  }

  logout(): void {

  }

  getUsername(): string | null {
    const token = this.tokenService.getToken();
    if (!token) return null;
    return (jwtDecode(token) as any).username;
  }
}
