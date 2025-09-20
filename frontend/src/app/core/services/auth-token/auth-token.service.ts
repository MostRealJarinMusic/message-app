import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService {
  private readonly tokenKey = 'auth_token';
  private tokenSubject = new BehaviorSubject<string | null>(null);

  setToken(token: string): void {
    if (typeof window !== 'undefined' && sessionStorage)
      sessionStorage.setItem(this.tokenKey, token);
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getSavedToken(): string | null {
    if (typeof window !== 'undefined' && sessionStorage) {
      return sessionStorage.getItem(this.tokenKey);
    }
    return null;
  }

  clearToken(): void {
    if (typeof window !== 'undefined' && sessionStorage) sessionStorage.removeItem(this.tokenKey);
    this.tokenSubject.next(null);
  }

  get token$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }
}
