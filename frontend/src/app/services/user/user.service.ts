import { inject, Injectable, signal } from '@angular/core';
import { User } from '@common/types';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { PrivateApiService } from '../api/private-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiService = inject(PrivateApiService);
  readonly currentUser = signal<User | null>(null);

  fetchCurrentUser(): Observable<User | null> {
    return this.apiService.getCurrentUser().pipe(
      tap((user) => {
        this.currentUser.set(user);
      }),
      catchError((err) => {
        console.error('Failed to fetch current user:', err);
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  clearUser(): void {
    this.currentUser.set(null);
  }

  // getUsername(userId: string): string {
  //   if (this.userCache.has(userId)) return this.userCache.get(userId)!.username;

  //   this.apiService.getUserById(userId).pipe(
  //     tap((user) => {
  //       this.userCache.set(userId, user);
  //       return user.username;
  //     }),
  //     catchError((err) => {
  //       return 'user-not-found';
  //     })
  //   );

  //   return 'user-not-found';
  // }

  // getUsername(userId: string): Observable<string> {
  //   if (this.userCache.has(userId)) {
  //     return of(this.userCache.get(userId)!.username);
  //   }

  //   return this.apiService.getUserById(userId).pipe(
  //     tap((user) => {
  //       this.userCache.set(userId, user);
  //     }),
  //     map((user) => user.username),
  //     catchError(() => of('user-not-found'))
  //   );
  // }

  // getUsername(userId: string): string {
  //   return this.userCache.get(userId)!.username ?? 'loading...';
  // }

  // preloadUsers(userIds: string[]): Observable<void> {
  //   const missingIds = userIds.filter((id) => !this.userCache.has(id));

  //   if (missingIds.length === 0) {
  //     return of(void 0);
  //   }

  //   return this.apiService.getUsersByIds(missingIds).pipe(
  //     tap((users: User[]) => {
  //       users.forEach((user) => {
  //         this.userCache.set(user.id, user);
  //       });
  //     }),
  //     map(() => void 0),
  //     catchError(() => of(void 0))
  //   );
  // }
}
