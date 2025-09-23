import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService {
  private readonly TOKEN_KEY = 'access_token';
  private tokenSubject = new BehaviorSubject<string | null>(null);

  setToken(token: string): void {
    if (this.isBrowser()) localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  clearToken(): void {
    if (this.isBrowser()) localStorage.removeItem(this.TOKEN_KEY);
    this.tokenSubject.next(null);
  }

  get token$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  private isBrowser() {
    return typeof window !== 'undefined' && localStorage;
  }
}
