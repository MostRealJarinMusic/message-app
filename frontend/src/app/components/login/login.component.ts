import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { SocketService } from '../../services/socket/socket.service';
import { AuthtokenService } from '../../services/authtoken/authtoken.service';

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
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private wsService: SocketService, private tokenService: AuthtokenService, private router: Router) {}

  async onLogin() {
    const success = await this.authService.login(this.username, this.password);
    if (success) {
      this.wsService.connect(this.tokenService.getToken());
      this.router.navigate(['/dashboard']);
    } else {
      //Failed login
      alert('Login failed');
    }
  }
}
