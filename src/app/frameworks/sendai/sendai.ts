import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTableModule } from 'ng-zorro-antd/table';

import type { PrioritiesForAction, Sendai as SendaiModel } from '../../models/SENDAI';

@Component({
  selector: 'app-sendai',
  imports: [NzCardModule, NzCollapseModule, NzTableModule],
  templateUrl: './sendai.html',
  styleUrl: './sendai.css',
})
export class Sendai {
  private http = inject(HttpClient);

  data = signal<SendaiModel | null>(null);
  guidingPrinciples = computed(() => this.data()?.guiding_principles ?? []);
  prioritiesForAction = computed(() => this.data()?.priorities_for_action ?? []);
  globalTargets = computed(() => this.data()?.global_targets ?? []);

  constructor() {
    this.http.get<SendaiModel>('data/SENDAI.json').subscribe((data) => {
      this.data.set(data);
    });
  }

  levelItems(priority: PrioritiesForAction, level: 'national' | 'global'): string[] {
    const items = level === 'national'
      ? priority.national_and_local_levels
      : priority.global_and_regional_levels;

    return items.map((item) => `${item.item} ${item.summary}`);
  }
}
