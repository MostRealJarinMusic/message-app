import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'auth_token';

  login(username: string, password: string): Promise<boolean> {
    return fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem(this.tokenKey, data.token);
          return true;
        }
        return false;
      });
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
