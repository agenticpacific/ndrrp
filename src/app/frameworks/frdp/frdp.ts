import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTableModule } from 'ng-zorro-antd/table';

import type { Frdp as FrdpModel, Goal } from '../../models/FRDP';

@Component({
  selector: 'app-frdp',
  imports: [NzCardModule, NzCollapseModule, NzTableModule],
  templateUrl: './frdp.html',
  styleUrl: './frdp.css',
})
export class Frdp {
  private http = inject(HttpClient);

  data = signal<FrdpModel | null>(null);
  guidingPrinciples = computed(() => this.data()?.guiding_principles ?? []);
  goals = computed(() => this.data()?.goals ?? []);

  constructor() {
    this.http.get<FrdpModel>('data/FRDP.json').subscribe((data) => {
      this.data.set(data);
    });
  }

  goalActions(goal: Goal, role: keyof Goal['priority_actions']): string[] {
    return goal.priority_actions[role].map((item) => `${item.action} ${item.summary}`);
  }
}
