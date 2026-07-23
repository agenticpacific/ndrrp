import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

type IndicatorType = 'Numeric' | 'Qualitative' | 'Evidence-linked';
type IndicatorStatus = 'On Track' | 'Needs Attention' | 'Critical';

interface FrameworkRow {
  id: 1 | 2 | 3 | 4 | 5;
  color: string;
  label: string;
  frdpTheme: string;
  sendaiSo: string;
  ndrrpFocus: string;
  ndpFocus: string;
}

interface OutcomeIndicator {
  id: number;
  rowId: 1 | 2 | 3 | 4 | 5;
  title: string;
  indicatorType: IndicatorType;
  leadAgency: string;
  unit: string;
  baseline: number;
  target: number;
  actual: number;
  lastUpdated: string;
  evidenceUrl: string;
}

@Component({
  selector: 'app-outcome',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzProgressModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './outcome.html',
  styleUrl: './outcome.css',
})
export class Outcome {
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);

  protected readonly frameworkRows: FrameworkRow[] = [
    {
      id: 1,
      color: '#1677ff',
      label: 'Row 1 - Blue',
      frdpTheme: 'Resilient Communities',
      sendaiSo: 'SO1 Understanding Disaster Risk',
      ndrrpFocus: 'Governance and Risk Profiling',
      ndpFocus: 'Risk Profiling and Data Systems',
    },
    {
      id: 2,
      color: '#722ed1',
      label: 'Row 2 - Purple',
      frdpTheme: 'Institutions and Governance',
      sendaiSo: 'SO2 Strengthening Governance',
      ndrrpFocus: 'Policy Mainstreaming',
      ndpFocus: 'Good Governance',
    },
    {
      id: 3,
      color: '#fa8c16',
      label: 'Row 3 - Orange',
      frdpTheme: 'Resilient Infrastructure',
      sendaiSo: 'SO3 Investing in DRR',
      ndrrpFocus: 'Preparedness and Financing',
      ndpFocus: 'Economic Resilience',
    },
    {
      id: 4,
      color: '#f5222d',
      label: 'Row 4 - Red',
      frdpTheme: 'Preparedness and Recovery',
      sendaiSo: 'SO4 Response and Recovery',
      ndrrpFocus: 'Emergency Response',
      ndpFocus: 'People Empowerment',
    },
    {
      id: 5,
      color: '#52c41a',
      label: 'Row 5 - Green',
      frdpTheme: 'Cross-cutting Inclusion',
      sendaiSo: 'SO1-SO4 Cross-cutting',
      ndrrpFocus: 'Gender and Inclusion',
      ndpFocus: 'Climate and Social Inclusion',
    },
  ];

  protected readonly indicators = signal<OutcomeIndicator[]>([
    {
      id: 1,
      rowId: 1,
      title: 'National multi-hazard risk map coverage',
      indicatorType: 'Numeric',
      leadAgency: 'Fiji Meteorological Service',
      unit: '% coverage',
      baseline: 42,
      target: 100,
      actual: 68,
      lastUpdated: '2026-06-30',
      evidenceUrl: 'https://ndmo.gov.fj/reports/risk-mapping-2026-q2',
    },
    {
      id: 2,
      rowId: 2,
      title: 'Ministries with approved DRR-integrated annual plans',
      indicatorType: 'Numeric',
      leadAgency: 'NDRMO',
      unit: 'ministries',
      baseline: 8,
      target: 20,
      actual: 13,
      lastUpdated: '2026-06-20',
      evidenceUrl: 'https://ndmo.gov.fj/reports/policy-integration-2026-q2',
    },
    {
      id: 3,
      rowId: 4,
      title: 'Districts with tested evacuation and response plans',
      indicatorType: 'Numeric',
      leadAgency: 'National Fire Authority',
      unit: 'districts',
      baseline: 21,
      target: 51,
      actual: 37,
      lastUpdated: '2026-07-03',
      evidenceUrl: 'https://ndmo.gov.fj/reports/evacuation-drills-2026-q2',
    },
    {
      id: 4,
      rowId: 5,
      title: 'Women and PWD representation in DRR committees',
      indicatorType: 'Numeric',
      leadAgency: 'Ministry of Women, Children and Social Protection',
      unit: '% representation',
      baseline: 24,
      target: 50,
      actual: 31,
      lastUpdated: '2026-06-18',
      evidenceUrl: 'https://ndmo.gov.fj/reports/inclusion-dashboard-2026-q2',
    },
  ]);

  protected readonly selectedIndicatorId = signal<number>(1);

  protected readonly indicatorForm = this.fb.nonNullable.group({
    rowId: this.fb.nonNullable.control<1 | 2 | 3 | 4 | 5>(1, Validators.required),
    title: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(5)]),
    indicatorType: this.fb.nonNullable.control<IndicatorType>('Numeric', Validators.required),
    leadAgency: this.fb.nonNullable.control('', Validators.required),
    unit: this.fb.nonNullable.control('', Validators.required),
    baseline: this.fb.nonNullable.control(0, Validators.required),
    target: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
    actual: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    evidenceUrl: this.fb.nonNullable.control('', Validators.required),
  });

  protected readonly rowOptions = this.frameworkRows.map((row) => ({
    label: row.label,
    value: row.id,
  }));

  protected readonly indicatorTypeOptions = [
    { label: 'Numeric', value: 'Numeric' },
    { label: 'Qualitative', value: 'Qualitative' },
    { label: 'Evidence-linked', value: 'Evidence-linked' },
  ];

  protected readonly selectedIndicator = computed(() =>
    this.indicators().find((item) => item.id === this.selectedIndicatorId()) ?? null,
  );

  protected readonly rowProgress = computed(() =>
    this.frameworkRows.map((row) => {
      const items = this.indicators().filter((indicator) => indicator.rowId === row.id);
      const average = items.length
        ? Math.round(items.reduce((sum, item) => sum + this.progress(item), 0) / items.length)
        : 0;
      return {
        ...row,
        average,
        count: items.length,
      };
    }),
  );

  protected progress(indicator: OutcomeIndicator): number {
    if (indicator.target <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round((indicator.actual / indicator.target) * 100)));
  }

  protected status(indicator: OutcomeIndicator): IndicatorStatus {
    const value = this.progress(indicator);
    if (value >= 75) {
      return 'On Track';
    }
    if (value >= 45) {
      return 'Needs Attention';
    }
    return 'Critical';
  }

  protected statusColor(indicator: OutcomeIndicator): string {
    const current = this.status(indicator);
    if (current === 'On Track') {
      return 'green';
    }
    if (current === 'Needs Attention') {
      return 'gold';
    }
    return 'red';
  }

  protected rowFor(id: 1 | 2 | 3 | 4 | 5): FrameworkRow {
    return this.frameworkRows.find((row) => row.id === id) ?? this.frameworkRows[0];
  }

  protected selectIndicator(id: number): void {
    this.selectedIndicatorId.set(id);
  }

  protected saveIndicator(): void {
    this.message.info('Saving is disabled in demo version.');
  }
}
