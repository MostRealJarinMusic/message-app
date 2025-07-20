import { TestBed } from '@angular/core/testing';

import { ChannelEditService } from './channel-edit.service';

describe('ChannelEditService', () => {
  let service: ChannelEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
