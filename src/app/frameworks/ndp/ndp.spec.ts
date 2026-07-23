import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ndp } from './ndp';

describe('Ndp', () => {
  let component: Ndp;
  let fixture: ComponentFixture<Ndp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ndp],
    }).compileComponents();

    fixture = TestBed.createComponent(Ndp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
