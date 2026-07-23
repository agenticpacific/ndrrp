import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sendai } from './sendai';

describe('Sendai', () => {
  let component: Sendai;
  let fixture: ComponentFixture<Sendai>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sendai],
    }).compileComponents();

    fixture = TestBed.createComponent(Sendai);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
