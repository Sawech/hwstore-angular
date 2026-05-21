import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Categories } from './categories';

describe('Categories', () => {
  let composant: Categories;
  let fixture: ComponentFixture<Categories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Categories],
    }).compileComponents();

    fixture = TestBed.createComponent(Categories);
    composant = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(composant).toBeTruthy();
  });
});
