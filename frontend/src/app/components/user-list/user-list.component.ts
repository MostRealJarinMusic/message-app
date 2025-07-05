import { Component, inject } from '@angular/core';
import { PresenceStatus } from '@common/types';
import { PresenceService } from 'src/app/services/presence/presence.service';

@Component({
  selector: 'app-user-list',
  imports: [],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  private presenceService = inject(PresenceService);
  protected presenceMap = this.presenceService.presenceMap;
  //protected users = this.presenceMap().keys();

  get presenceEntries(): [string, PresenceStatus][] {
    return [...this.presenceMap().entries()];
  }
}
