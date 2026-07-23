import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Frdp } from './frdp';

describe('Frdp', () => {
  let component: Frdp;
  let fixture: ComponentFixture<Frdp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Frdp],
    }).compileComponents();

    fixture = TestBed.createComponent(Frdp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
