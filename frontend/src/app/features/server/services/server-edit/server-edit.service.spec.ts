import { TestBed } from '@angular/core/testing';

import { ServerEditService } from './server-edit.service';

describe('ServerEditService', () => {
  let service: ServerEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
