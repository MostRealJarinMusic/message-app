import { TestBed } from '@angular/core/testing';

import { ChannelCategoryService } from './channel-category.service';

describe('ChannelCategoryService', () => {
  let service: ChannelCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
