import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPaginationComponent } from './list-pagination.component';

describe('ListPaginationComponent', () => {
  let component: ListPaginationComponent;
  let fixture: ComponentFixture<ListPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPaginationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
