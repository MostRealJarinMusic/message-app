import { computed, inject, Injectable, signal } from '@angular/core';
import { UserService } from '../user/user.service';
import { PrivateUser, UserUpdate } from '@common/types';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class UserSettingsService {
  private userService = inject(UserService);

  private editedUser = signal<PrivateUser | null>(null);
  private initialUser = signal<PrivateUser | null>(null);

  readonly currentlyEditedUser = this.editedUser.asReadonly();
  readonly isDirty = computed(() => {
    return this.editActive() && this.editedUser() !== this.initialUser();
  });

  readonly editActive = computed(() => {
    return this.editedUser() != null;
  });

  startEdit() {
    const user = this.userService.currentUser();

    if (!user) return;

    this.editedUser.set(user);
    this.initialUser.set(user);
  }

  closeEdit() {
    this.editedUser.set(null);
    this.initialUser.set(null);
  }

  saveEdit(form: FormGroup) {
    if (form.invalid) return;

    try {
      const update = form.value as UserUpdate;
      this.userService.updateUserSettings(update);

      form.markAsPristine();
    } catch (err) {
      console.error('Failed to update user settings:', err);
    }
  }

  resetEditForm(form: FormGroup) {
    form.reset({
      bio: this.initialUser()!.bio,
    });

    form.markAsPristine();
  }
}
