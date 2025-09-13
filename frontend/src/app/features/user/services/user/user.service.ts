import { effect, inject, Injectable, signal } from '@angular/core';
import {
  LoggerType,
  PublicUser,
  PrivateUser,
  WSEvent,
  WSEventType,
  UserUpdate,
} from '@common/types';
import { catchError, firstValueFrom, Observable, of, tap } from 'rxjs';
import { PrivateApiService } from '../../../../core/services/api/private-api.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';
import { SocketService } from 'src/app/core/services/socket/socket.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiService = inject(PrivateApiService);
  private wsService = inject(SocketService);
  private navService = inject(NavigationService);
  private logger = inject(LoggerService);

  readonly currentUser = signal<PrivateUser | null>(null);
  private userCache = new Map<string, PublicUser>();
  readonly serverUsers = signal<PublicUser[] | null>(null);
  readonly usernameMap = new Map<string, string>();

  constructor() {
    this.logger.init(LoggerType.SERVICE_USER);

    this.initWebSocket();

    //Temporary
    this.loadUsers();

    effect(() => {
      const currentServer = this.navService.activeServerId();
      if (currentServer) {
        this.loadServerUsers(currentServer);
      } else {
        //this.serverUsers.set(null);
      }
    });
  }

  // loadCurrentUser() {
  //   return this.apiService.getCurrentUser().subscribe({
  //     next: this.currentUser.set,
  //     error: (err) => {
  //       this.logger.error(LoggerType.SERVICE_USER, 'Failed to fetch current user:', err);
  //       this.currentUser.set(null);
  //     },
  //   });
  // }

  loadCurrentUser(): Promise<PrivateUser> {
    return firstValueFrom(
      this.apiService.getCurrentUser().pipe(
        tap((user) => this.currentUser.set(user)),
        catchError((err) => {
          this.currentUser.set(null);
          throw err;
        }),
      ),
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

  private loadServerUsers(serverId: string): void {
    this.apiService.getServerUsers(serverId).subscribe({
      next: (users) => {
        users.forEach((user) => this.userCache.set(user.id, user));
        this.serverUsers.set(users);
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_USER, 'Error loading server users', err);
      },
    });
  }

  private loadUsers(): void {
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        users.forEach((user) => this.userCache.set(user.id, user));
        this.serverUsers.set(users);

        //this.logger.log(LoggerType.SERVICE_USER, '', users);
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_USER, 'Error loading server users', err);
      },
    });
  }

  private initWebSocket() {
    this.wsService.on(WSEventType.USER_UPDATE).subscribe({
      next: (updatedUser) => {
        console.log(updatedUser);

        //Assuming this isn't an edit for you
        const existing = this.userCache.get(updatedUser.id);

        this.userCache.set(updatedUser.id, { ...existing, ...updatedUser });

        if (!this.serverUsers() || this.serverUsers() === null) return;

        this.serverUsers.update((serverUsers) => {
          if (!serverUsers) return serverUsers;

          return serverUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u));
        });
      },
      error: (err) => {
        console.log('Failed to update user:', err);
      },
    });
  }

  public updateUserSettings(update: UserUpdate) {
    this.apiService.updateUserSettings(update).subscribe({
      next: (updatedUser) => {
        this.currentUser.set(updatedUser);

        this.logger.log(LoggerType.SERVICE_USER, 'Successful user update');
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_USER, 'Failed to update user', err);
      },
    });
  }
}
