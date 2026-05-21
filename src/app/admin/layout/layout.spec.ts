import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLayoutComposant } from './layout';

describe('AdminLayoutComposant', () => {
  let component: AdminLayoutComposant;
  let fixture: ComponentFixture<AdminLayoutComposant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComposant],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayoutComposant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
