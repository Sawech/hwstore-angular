import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Composants } from './composants';

describe('Composants', () => {
  let component: Composants;
  let fixture: ComponentFixture<Composants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Composants],
    }).compileComponents();

    fixture = TestBed.createComponent(Composants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
