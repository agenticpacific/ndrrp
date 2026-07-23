import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTableModule } from 'ng-zorro-antd/table';

import type { Ndp as NdpModel } from '../../models/NDP';

@Component({
  selector: 'app-ndp',
  imports: [NzCardModule, NzCollapseModule, NzTableModule],
  templateUrl: './ndp.html',
  styleUrl: './ndp.css',
})
export class Ndp {
  private http = inject(HttpClient);

  data = signal<NdpModel | null>(null);
  crossCuttingPriorities = computed(() => this.data()?.cross_cutting_priorities ?? []);
  pillars = computed(() => this.data()?.pillars ?? []);
  xFactors = computed(() => this.data()?.x_factors ?? []);
  targetsAndKpis = computed(() => this.data()?.targets_and_kpis ?? []);

  constructor() {
    this.http.get<NdpModel>('data/NDP.json').subscribe((data) => {
      this.data.set(data);
    });
  }
}
