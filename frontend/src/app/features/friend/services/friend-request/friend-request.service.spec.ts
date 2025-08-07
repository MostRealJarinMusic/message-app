import { TestBed } from '@angular/core/testing';

import { FriendRequestService } from './friend-request.service';

describe('FriendRequestService', () => {
  let service: FriendRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
