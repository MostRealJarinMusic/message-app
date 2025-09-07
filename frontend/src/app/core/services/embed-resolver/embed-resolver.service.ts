import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EmbedData, EmbedType } from '@common/types';
import { firstValueFrom } from 'rxjs';
import { InviteService } from 'src/app/features/invite/services/invite/invite.service';

@Injectable({
  providedIn: 'root',
})
export class EmbedResolverService {
  private inviteRegex = /https?:\/\/message-app\/invite\/([0-9a-fA-F-]{36})/;
  private inviteService = inject(InviteService);

  constructor() {}

  async resolve(url: string): Promise<EmbedData | null> {
    if (this.inviteRegex.test(url)) {
      const match = url.match(this.inviteRegex);

      if (!match || !match[1]) return null;

      try {
        const invite = await firstValueFrom(this.inviteService.previewInvite(match[1]));

        const embedData: EmbedData = {
          type: EmbedType.INVITE,
          url,
          meta: invite,
        };

        return embedData;
      } catch (err) {
        console.log('Failed to preview invite');
        throw err;
      }
    }

    return null;
  }
}
