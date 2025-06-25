import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { SocketService } from '../../services/socket/socket.service';
import { AuthTokenService } from '../../services/authtoken/authtoken.service';
import { TabsModule } from 'primeng/tabs';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { LoginCredentials, RegisterPayload } from '@common/types';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule, 
    InputTextModule, 
    ButtonModule, 
    CardModule,
    CheckboxModule,
    ReactiveFormsModule,
    PasswordModule,
    TabsModule,
    DividerModule,
    IconFieldModule,
    InputIconModule,
    FloatLabelModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  email = '';
  password = '';

  constructor(private authService: AuthService, private tokenService: AuthTokenService, private router: Router) {}

  async onLogin() {
    const loginCredentials: LoginCredentials = {
      username: this.username,
      password: this.password
    }

    const success = await this.authService.login(loginCredentials);
    if (success) {
      this.navigateToDashboard();
    } else {
      //Failed login
      alert('Login failed');
    }
  }

  async onRegister() {
    console.log("Attempt to register account");

    const registerPayload: RegisterPayload = {
      username: this.username,
      email: this.email,
      password: this.password
    }

    const success = await this.authService.register(registerPayload);
    if (success) {
      this.navigateToDashboard();
    } else {
      //Failed register
      alert('Login failed');
    }
  }

  private navigateToDashboard() {
    console.log(this.tokenService.getToken());
    //this.wsService.connect(this.tokenService.getToken());
    this.router.navigate(['/dashboard']);
  }
}
