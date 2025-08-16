import { effect, inject, Injectable, signal } from '@angular/core';
import { LoggerType, User } from '@common/types';
import { catchError, Observable, of, tap } from 'rxjs';
import { PrivateApiService } from '../../../../core/services/api/private-api.service';
import { ServerService } from 'src/app/features/server/services/server/server.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiService = inject(PrivateApiService);
  private serverService = inject(ServerService);
  private navService = inject(NavigationService);
  private logger = inject(LoggerService);

  readonly currentUser = signal<User | null>(null);
  private userCache = new Map<string, User>();
  readonly serverUsers = signal<User[] | null>(null);
  readonly usernameMap = new Map<string, string>();

  constructor() {
    effect(() => {
      const currentServer = this.navService.currentServerId();
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
        this.logger.error(LoggerType.SERVICE_USER, 'Failed to fetch current user:', err);
        this.currentUser.set(null);
        return of(null);
      }),
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

        this.logger.log(LoggerType.SERVICE_USER, '', users);
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_USER, 'Error loading server users', err);
      },
    });
  }
}
