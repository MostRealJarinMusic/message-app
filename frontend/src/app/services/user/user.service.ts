import { Injectable } from '@angular/core';
import { User } from '@common/types';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { AuthTokenService } from '../authtoken/auth-token.service';
import { ApiService } from '../api/api.service';
import { PrivateApiService } from '../api/private-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  //Local user cache
  private userCache = new Map<string, User>();

  constructor(private apiService: PrivateApiService) {}

  fetchCurrentUser(): Observable<User> {
    return this.apiService.getCurrentUser().pipe(
      tap((user) => {
        this.userSubject.next(user);
      }),
      catchError((err) => {
        console.error('Failed to fetch current user:', err);
        this.userSubject.next(null);
        return of(null as any);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  clearUser(): void {
    this.userSubject.next(null);
  }
}
