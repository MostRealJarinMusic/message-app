import { TestBed } from '@angular/core/testing';

import { ChannelCategoryEditService } from './channel-category-edit.service';

describe('ChannelCategoryEditService', () => {
  let service: ChannelCategoryEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelCategoryEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
