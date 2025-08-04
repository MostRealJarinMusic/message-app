import { TestBed } from '@angular/core/testing';

import { MessageEditService } from './message-edit.service';

describe('MessageEditService', () => {
  let service: MessageEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
