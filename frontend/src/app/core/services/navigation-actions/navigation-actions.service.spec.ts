import { TestBed } from '@angular/core/testing';

import { NavigationActionsService } from './navigation-actions.service';

describe('NavigationActionsService', () => {
  let service: NavigationActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavigationActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
