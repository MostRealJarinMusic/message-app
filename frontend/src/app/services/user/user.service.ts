import { Injectable } from '@angular/core';
import { User } from '@common/types';
import { BehaviorSubject, catchError, firstValueFrom, Observable, of, tap } from 'rxjs';
import { AuthTokenService } from '../authtoken/auth-token.service';
import { ApiService } from '../api/api.service';
import { PrivateApiService } from '../api/private-api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  //Local user cache
  private userCache = new Map<string, User>();

  constructor(private apiService: PrivateApiService) { }

  // private async loadUser(): Promise<void> {
  //   console.log('Attempting to load user')


  //   const token = this.tokenService.getToken();
  //   if (!token) return;


  //   console.log('We have a token')
  //   try {
  //     const user = await firstValueFrom(this.apiService.get<User>('auth/me'));
  //     this.userSubject.next(user);
  //     console.log(user)
  //   } catch (err) {
  //     console.error('Failed to load user:', err);
  //     this.userSubject.next(null);
  //   }
  // }

  // getCurrentUser(): User | null {
  //   return this.userSubject.value;
  // }

  // refreshUser(): Promise<void> {
  //   return this.loadUser();
  // }

  // getUsernameById(id: string): string | null {
  //   return this.userCache.get(id)?.username ?? null
  // }

  // async fetchUser(id: string): Promise<void> {
  //   if (this.userCache.has(id)) return;
  //   try {
  //     const user = await firstValueFrom(this.apiService.get<User>(`users/${id}`));
  //     this.userCache.set(id, user);
  //   } catch (err) {
  //     console.error(`Failed to fetch user ${id}`, err);
  //   }
  // }

  fetchCurrentUser(): Observable<User> {
    return this.apiService.getCurrentUser().pipe(
      tap(user => {
        this.userSubject.next(user);
      }),
      catchError(err => {
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
