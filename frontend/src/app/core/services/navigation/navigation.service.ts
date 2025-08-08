import { Injectable, signal } from '@angular/core';
import { NavigationView } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  readonly currentView = signal<NavigationView>(NavigationView.SERVERS);

  constructor() {}

  setView(view: NavigationView) {
    this.currentView.set(view);
  }
}
