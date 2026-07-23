import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTableModule } from 'ng-zorro-antd/table';

import type { Ndrrp as NdrrpModel, ActionItemsCategory } from '../../models/NDRRP';

@Component({
  selector: 'app-ndrrp',
  imports: [NzCardModule, NzCollapseModule, NzTableModule],
  templateUrl: './ndrrp.html',
  styleUrl: './ndrrp.css',
})
export class Ndrrp {
  private http = inject(HttpClient);

  data = signal<NdrrpModel | null>(null);
  guidingPrinciples = computed(() => this.data()?.guiding_principles ?? []);
  policyStrategies = computed(() => this.data()?.policy_strategies ?? []);
  actionItemCategories = computed(() => this.data()?.action_items_categories ?? []);
  policyPremise = computed(() => {
    const premise = this.data()?.policy_premise;
    if (!premise) {
      return [];
    }

    return [
      {
        title: 'Characteristics of Climate Change and Disaster Risks',
        summary: premise.characteristics_of_climate_change_and_disaster_risks.summary,
      },
      {
        title: 'Sectoral Implications',
        summary: premise.sectoral_implications.summary,
      },
      {
        title: 'Constrained Conditions',
        summary: premise.constrained_conditions.summary,
      },
    ];
  });

  constructor() {
    this.http.get<NdrrpModel>('data/NDRRP.json').subscribe((data) => {
      this.data.set(data);
    });
  }

  actionReferences(category: ActionItemsCategory): string[] {
    return category.identified_action_references.map((item) => `${item.number}. ${item.action}`);
  }
}
