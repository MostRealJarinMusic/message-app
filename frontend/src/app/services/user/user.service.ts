import { inject, Injectable, signal } from '@angular/core';
import { User } from '@common/types';
import { catchError, firstValueFrom, Observable, of, tap } from 'rxjs';
import { PrivateApiService } from '../api/private-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiService = inject(PrivateApiService);

  readonly currentUser = signal<User | null>(null);
  private userCache = new Map<string, User>();
  readonly usernameMap = signal<Map<string, string>>(new Map());

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

  getUsername(userId: string) {
    if (this.usernameMap().has(userId))
      return signal(this.usernameMap().get(userId)!);

    this.apiService.getUserById(userId).subscribe({
      next: (user) => {
        this.userCache.set(userId, user);
        const updated = new Map(this.usernameMap());
        updated.set(userId, user.username);
        this.usernameMap.set(updated);
      },
      error: (err) => {
        console.error(`Error accessing user with ID: ${userId}`, err);
      },
    });

    return signal('Loading');
  }
}
