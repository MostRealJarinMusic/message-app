import { TestBed } from '@angular/core/testing';

import { MessageDraftService } from './message-draft.service';

describe('MessageDraftService', () => {
  let service: MessageDraftService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageDraftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
