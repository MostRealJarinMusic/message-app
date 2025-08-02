import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServerEditService {
  private editedServerId = signal<string | null>(null);
  readonly currentlyEditedId = this.editedServerId.asReadonly();

  startEdit(id: string) {
    this.editedServerId.set(id);
  }

  closeEdit() {
    this.editedServerId.set(null);
  }
}
