import { inject, Injectable } from '@angular/core';
import { LoggerType, ServerInviteCreate } from '@common/types';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Injectable({
  providedIn: 'root',
})
export class InviteService {
  private apiService = inject(PrivateApiService);
  private logger = inject(LoggerService);

  constructor() {}

  public previewInvite(inviteLink: string) {
    this.apiService.previewInvite(inviteLink).subscribe({
      next: (invite) => invite,
      error: (err) => this.logger.error(LoggerType.SERVICE_INVITE, 'Failed to preview invite', err),
    });
  }

  public createInvite(serverId: string) {
    const inviteCreate: ServerInviteCreate = {
      serverId,
    };

    return this.apiService.createInvite(inviteCreate);
  }

  public acceptInvite(inviteLink: string) {
    return this.apiService.acceptInvite(inviteLink);
  }
}
