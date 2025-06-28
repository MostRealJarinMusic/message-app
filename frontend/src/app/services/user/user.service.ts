import { Injectable, signal } from '@angular/core';
import { User } from '@common/types';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { PrivateApiService } from '../api/private-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // private userSubject = new BehaviorSubject<User | null>(null);
  // public user$ = this.userSubject.asObservable();

  readonly currentUser = signal<User | null>(null);

  //Local user cache
  private userCache = new Map<string, User>();

  constructor(private apiService: PrivateApiService) {}

  fetchCurrentUser(): Observable<User> {
    return this.apiService.getCurrentUser().pipe(
      tap((user) => {
        this.currentUser.set(user);
      }),
      catchError((err) => {
        console.error('Failed to fetch current user:', err);
        this.currentUser.set(null);
        return of(null as any);
      })
    );
  }

  clearUser(): void {
    this.currentUser.set(null);
  }
}
