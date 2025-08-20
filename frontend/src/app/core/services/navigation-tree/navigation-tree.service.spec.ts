import { TestBed } from '@angular/core/testing';

import { NavigationTreeService } from './navigation-tree.service';

describe('NavigationTreeService', () => {
  let service: NavigationTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavigationTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
