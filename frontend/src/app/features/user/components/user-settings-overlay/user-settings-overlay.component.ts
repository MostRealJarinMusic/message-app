import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FullscreenOverlayComponent } from 'src/app/shared/components/custom/fullscreen-overlay/fullscreen-overlay.component';
import { UserSettingsService } from '../../services/user-settings/user-settings.service';

@Component({
  selector: 'app-user-settings-overlay',
  imports: [
    ButtonModule,
    CommonModule,
    FullscreenOverlayComponent,
    DividerModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: './user-settings-overlay.component.html',
  styleUrl: './user-settings-overlay.component.scss',
})
export class UserSettingsOverlayComponent {
  private formBuilder = inject(FormBuilder);
  protected userSettingsService = inject(UserSettingsService);

  protected userSettingsForm = this.formBuilder.group({
    bio: new FormControl<string>(''),
  });

  constructor() {
    effect(() => {
      if (this.userSettingsService.editActive()) {
        this.userSettingsService.resetEditForm(this.userSettingsForm);
      }
    });
  }
}
