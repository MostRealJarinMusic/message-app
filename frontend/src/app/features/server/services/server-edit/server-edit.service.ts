import { computed, inject, Injectable, signal } from '@angular/core';
import { Server, ServerUpdate } from '@common/types';
import { ServerService } from '../server/server.service';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ServerEditService {
  private serverService = inject(ServerService);

  private editedServerId = signal<string | null>(null);
  private editedServer = signal<Server | null>(null);
  private initialServer = signal<Server | null>(null);

  readonly currentlyEditedId = this.editedServerId.asReadonly();
  readonly currentlyEditedServer = this.editedServer.asReadonly();
  readonly currentInitialServer = this.initialServer.asReadonly();
  readonly isDirty = computed(() => {
    return (
      this.editedServerId() !== null &&
      this.editedServer() !== this.initialServer()
    );
  });

  readonly editActive = computed(() => {
    return this.editedServerId() !== null;
  });

  startEdit(serverId: string) {
    const server = this.serverService.getServerById(serverId)!;

    this.editedServerId.set(serverId);
    this.editedServer.set(server);
    this.initialServer.set(server);
  }

  closeEdit() {
    this.editedServerId.set(null);
    this.editedServer.set(null);
    this.initialServer.set(null);
  }

  saveEdit(form: FormGroup) {
    if (form.invalid) return;

    try {
      const update = form.value as ServerUpdate;
      this.serverService.editServer(this.currentlyEditedId()!, update);

      form.markAsPristine();
    } catch (err) {
      console.error('Failed to update server:', err);
    }
  }

  resetEditForm(form: FormGroup) {
    form.reset({
      name: this.currentInitialServer()!.name,
      description: this.currentInitialServer()!.description,
    });

    form.markAsPristine();
  }
}
