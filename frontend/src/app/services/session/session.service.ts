import { Injectable } from '@angular/core';
import { User } from '@common/types';
import { AuthTokenService } from '../authtoken/auth-token.service';
import { UserService } from '../user/user.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private tokenService: AuthTokenService, 
    private userService: UserService
  ) { 
    //console.log("Session service created")

    const savedToken = this.tokenService.getSavedToken();
    if (savedToken) this.resumeSession(savedToken);
  }

  async startSession(token: string): Promise<void> {
    console.log("Starting session")
    this.tokenService.setToken(token);
    try {
      const user = await firstValueFrom(this.userService.fetchCurrentUser());
      this.userSubject.next(user);
    } catch (err) {
      this.endSession();
      throw err;
    }
  }

  endSession(): void {
    console.log('Ending session')
    this.tokenService.clearToken();
    this.userSubject.next(null);
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get tokenValue(): string | null {
    return this.tokenService.getToken();
  }

  private async resumeSession(token: string): Promise<void> {
    console.log("Resuming session");
    this.tokenService.setToken(token);
    try {
      const user = await firstValueFrom(this.userService.fetchCurrentUser());
      this.userSubject.next(user);
    } catch {
      this.endSession();
    }
  }
}
