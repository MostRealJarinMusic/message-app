import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthtokenService {
  private readonly tokenKey = 'auth_token';

  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken())

  constructor() { }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.tokenSubject.next(null);
  }

  token$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }
}
