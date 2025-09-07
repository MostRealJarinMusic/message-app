import { inject, Injectable } from '@angular/core';
import { LoggerType, ServerInviteCreate } from '@common/types';
import { firstValueFrom } from 'rxjs';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Injectable({
  providedIn: 'root',
})
export class InviteService {
  private apiService = inject(PrivateApiService);
  private logger = inject(LoggerService);

  constructor() {}

  public async previewInvite(inviteLink: string) {
    return await firstValueFrom(this.apiService.previewInvite(inviteLink));
  }

  public async createInvite(serverId: string) {
    const inviteCreate: ServerInviteCreate = {
      serverId,
    };

    return await firstValueFrom(this.apiService.createInvite(inviteCreate));
  }

  public constructLink(link: string) {
    return `https://message-app/invite/${link}`;
  }

  public acceptInvite(inviteLink: string) {
    return this.apiService.acceptInvite(inviteLink);
  }
}
