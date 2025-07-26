import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryCreateDialogComponent } from './category-create-dialog.component';

describe('CategoryCreateDialogComponent', () => {
  let component: CategoryCreateDialogComponent;
  let fixture: ComponentFixture<CategoryCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryCreateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
