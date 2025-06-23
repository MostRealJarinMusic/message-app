import { TestBed } from '@angular/core/testing';

import { AuthtokenService } from './authtoken.service';

describe('AuthtokenService', () => {
  let service: AuthtokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthtokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
