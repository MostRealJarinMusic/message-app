import { inject, Injectable } from '@angular/core';
import { LoggerType, ServerInviteCreate } from '@common/types';
import { firstValueFrom } from 'rxjs';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ServerService } from 'src/app/features/server/services/server/server.service';

@Injectable({
  providedIn: 'root',
})
export class InviteService {
  private apiService = inject(PrivateApiService);
  private serverService = inject(ServerService);
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

  public async acceptInvite(inviteLink: string) {
    const server = await firstValueFrom(this.apiService.acceptInvite(inviteLink));

    this.serverService.joinServer(server);
  }
}
