import { TestBed } from '@angular/core/testing';

import { EmbedResolverService } from './embed-resolver.service';

describe('EmbedResolverService', () => {
  let service: EmbedResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmbedResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
