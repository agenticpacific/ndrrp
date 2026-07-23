import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ndrrp } from './ndrrp';

describe('Ndrrp', () => {
  let component: Ndrrp;
  let fixture: ComponentFixture<Ndrrp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ndrrp],
    }).compileComponents();

    fixture = TestBed.createComponent(Ndrrp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
