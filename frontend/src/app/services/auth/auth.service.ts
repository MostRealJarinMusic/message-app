import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { ApiService } from '../api/api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'auth_token';

  constructor(private apiService: ApiService) {}

  // register(username: string, password: string): Promise<boolean> {
  // }

  async login(username: string, password: string): Promise<boolean> {
    const data = await firstValueFrom(this.apiService.post<{ token: string }>('auth/login', { username, password }));
    if (data && data.token) {
      localStorage.setItem(this.tokenKey, data.token);
      return true;
    }
    return false;
  }

  logout(): void {

  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    return (jwtDecode(token) as any).username;
  }
}
