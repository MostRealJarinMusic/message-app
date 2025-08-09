import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { CommonModule } from '@angular/common';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';

@Component({
  selector: 'app-friends-title-bar',
  imports: [ButtonModule, IconField, CommonModule],
  templateUrl: './friends-title-bar.component.html',
  styleUrl: './friends-title-bar.component.scss',
})
export class FriendsTitleBarComponent {
  protected navService = inject(NavigationService);
}
