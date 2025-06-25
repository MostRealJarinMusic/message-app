import { TestBed } from '@angular/core/testing';

import { PrivateApiService } from './private-api.service';

describe('PrivateApiService', () => {
  let service: PrivateApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivateApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
