import { effect, inject, Injectable, signal } from '@angular/core';
import { User } from '@common/types';
import { catchError, Observable, of, tap } from 'rxjs';
import { PrivateApiService } from '../../../../core/services/api/private-api.service';
import { ServerService } from 'src/app/features/server/services/server/server.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiService = inject(PrivateApiService);
  private serverService = inject(ServerService);

  readonly currentUser = signal<User | null>(null);
  private userCache = new Map<string, User>();
  readonly serverUsers = signal<User[] | null>(null);
  readonly usernameMap = new Map<string, string>();

  constructor() {
    effect(() => {
      const currentServer = this.serverService.currentServer();
      if (currentServer) {
        this.loadServerUsers(currentServer);
      } else {
        this.serverUsers.set(null);
      }
    });
  }

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
    return this.userCache.get(userId)!.username || 'Unknown User';
  }

  getUser(userId: string) {
    return this.userCache.get(userId) || undefined;
  }

  public loadServerUsers(serverId: string): void {
    this.apiService.getServerUsers(serverId).subscribe({
      next: (users) => {
        users.forEach((user) => this.userCache.set(user.id, user));
        this.serverUsers.set(users);

        console.log(users)
      },
      error: (err) => {
        console.error('Error loading server users', err);
      },
    });
  }
}
