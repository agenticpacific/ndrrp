import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

type ActivityStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';

interface FrameworkRowLegend {
  id: 1 | 2 | 3 | 4 | 5;
  label: string;
  color: string;
}

interface SubActivity {
  id: number;
  title: string;
  owner: string;
  dueDate: string;
  weight: number;
  progress: number;
  status: ActivityStatus;
  evidenceUrl: string;
  secondaryRows: Array<1 | 2 | 3 | 4 | 5>;
}

interface ActionActivity {
  id: number;
  actionItemNo: number;
  title: string;
  sector: string;
  leadAgency: string;
  primaryRow: 1 | 2 | 3 | 4 | 5;
  timeline: string;
  subActivities: SubActivity[];
}

interface NdrppActionItemsPayload {
  action_items_categories?: Array<{
    identified_action_references?: Array<{
      number: number;
      action: string;
    }>;
  }>;
}

interface NdrppActionOption {
  number: number;
  action: string;
}

@Component({
  selector: 'app-activity',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzProgressModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './activity.html',
  styleUrl: './activity.css',
})
export class Activity {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private message = inject(NzMessageService);

  protected readonly rows: FrameworkRowLegend[] = [
    { id: 1, label: 'Row 1 - Blue', color: '#1677ff' },
    { id: 2, label: 'Row 2 - Purple', color: '#722ed1' },
    { id: 3, label: 'Row 3 - Orange', color: '#fa8c16' },
    { id: 4, label: 'Row 4 - Red', color: '#f5222d' },
    { id: 5, label: 'Row 5 - Green', color: '#52c41a' },
  ];

  protected readonly activities = signal<ActionActivity[]>([
    {
      id: 1,
      actionItemNo: 65,
      title: 'Implement Multi-Hazard Early Warning System',
      sector: 'Meteorology and Communications',
      leadAgency: 'Fiji Meteorological Service',
      primaryRow: 1,
      timeline: 'Q1-Q4 2026',
      subActivities: [
        {
          id: 1,
          title: 'Deploy rainfall and flood sensors in high-risk basins',
          owner: 'Hydrology Division',
          dueDate: '2026-09-30',
          weight: 35,
          progress: 62,
          status: 'In Progress',
          evidenceUrl: 'https://ndmo.gov.fj/evidence/sensors-q2',
          secondaryRows: [3],
        },
        {
          id: 2,
          title: 'Integrate SMS and siren alert protocols',
          owner: 'Telecom Authority',
          dueDate: '2026-10-15',
          weight: 40,
          progress: 48,
          status: 'In Progress',
          evidenceUrl: 'https://ndmo.gov.fj/evidence/sms-siren-q2',
          secondaryRows: [4],
        },
        {
          id: 3,
          title: 'Community simulation drills for warning validation',
          owner: 'NDMO Divisional Office West',
          dueDate: '2026-11-30',
          weight: 25,
          progress: 30,
          status: 'In Progress',
          evidenceUrl: 'https://ndmo.gov.fj/evidence/drills-west-q2',
          secondaryRows: [5],
        },
      ],
    },
    {
      id: 2,
      actionItemNo: 39,
      title: 'Operationalize Disaster Recovery Subsidy Programme',
      sector: 'Finance and Social Protection',
      leadAgency: 'Ministry of Finance',
      primaryRow: 3,
      timeline: 'Q2 2026-Q2 2027',
      subActivities: [
        {
          id: 1,
          title: 'Finalize subsidy eligibility framework',
          owner: 'Budget Policy Unit',
          dueDate: '2026-08-20',
          weight: 30,
          progress: 85,
          status: 'In Progress',
          evidenceUrl: 'https://ndmo.gov.fj/evidence/subsidy-guideline-v3',
          secondaryRows: [2],
        },
        {
          id: 2,
          title: 'Pilot disbursement in three high-risk districts',
          owner: 'Treasury Operations',
          dueDate: '2026-12-10',
          weight: 45,
          progress: 52,
          status: 'In Progress',
          evidenceUrl: 'https://ndmo.gov.fj/evidence/pilot-disbursement-q2',
          secondaryRows: [4, 5],
        },
        {
          id: 3,
          title: 'Monitoring dashboard for subsidy impact',
          owner: 'Government ICT Centre',
          dueDate: '2027-01-15',
          weight: 25,
          progress: 40,
          status: 'In Progress',
          evidenceUrl: 'https://ndmo.gov.fj/evidence/subsidy-dashboard-alpha',
          secondaryRows: [1],
        },
      ],
    },
  ]);

  protected readonly selectedActivityId = signal<number>(1);
  protected readonly ndrrpActionItems = signal<NdrppActionOption[]>([]);
  protected readonly createActivityModalVisible = signal(false);

  protected readonly subActivityForm = this.fb.nonNullable.group({
    actionItemNo: this.fb.nonNullable.control(65, Validators.required),
    title: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(5)]),
    description: this.fb.nonNullable.control(''),
    owner: this.fb.nonNullable.control('', Validators.required),
    dueDate: this.fb.nonNullable.control('', Validators.required),
    weight: this.fb.nonNullable.control(10, [Validators.required, Validators.min(1), Validators.max(100)]),
    progress: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0), Validators.max(100)]),
    status: this.fb.nonNullable.control<ActivityStatus>('Not Started', Validators.required),
    evidenceUrl: this.fb.nonNullable.control('', Validators.required),
    secondaryRows: this.fb.nonNullable.control<Array<1 | 2 | 3 | 4 | 5>>([], Validators.required),
  });

  protected readonly rowOptions = this.rows.map((row) => ({
    label: row.label,
    value: row.id,
  }));

  protected readonly statusOptions = [
    { label: 'Not Started', value: 'Not Started' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Blocked', value: 'Blocked' },
  ];

  protected readonly parentActivityOptions = computed(() =>
    this.ndrrpActionItems().map((item) => ({
      value: item.number,
      label: `${item.number} - ${item.action}`,
    })),
  );

  constructor() {
    this.loadNdrppActionItems();
  }

  protected readonly selectedActivity = computed(() =>
    this.activities().find((item) => item.id === this.selectedActivityId()) ?? null,
  );

  protected readonly sectorProgress = computed(() => {
    const bySector = new Map<string, number[]>();
    for (const activity of this.activities()) {
      const list = bySector.get(activity.sector) ?? [];
      list.push(this.weightedProgress(activity));
      bySector.set(activity.sector, list);
    }
    return Array.from(bySector.entries()).map(([sector, values]) => ({
      sector,
      value: Math.round(values.reduce((sum, item) => sum + item, 0) / values.length),
    }));
  });

  protected readonly rowContribution = computed(() =>
    this.rows.map((row) => {
      const scores: number[] = [];
      for (const activity of this.activities()) {
        if (activity.primaryRow === row.id) {
          scores.push(this.weightedProgress(activity));
        }
        for (const sub of activity.subActivities) {
          if (sub.secondaryRows.includes(row.id)) {
            scores.push(sub.progress);
          }
        }
      }
      const value = scores.length
        ? Math.round(scores.reduce((sum, item) => sum + item, 0) / scores.length)
        : 0;
      return { ...row, value };
    }),
  );

  protected weightedProgress(activity: ActionActivity): number {
    const totalWeight = activity.subActivities.reduce((sum, item) => sum + item.weight, 0);
    if (!totalWeight) {
      return 0;
    }
    const weighted = activity.subActivities.reduce(
      (sum, item) => sum + (item.progress * item.weight) / 100,
      0,
    );
    return Math.round((weighted / totalWeight) * 100);
  }

  protected statusFor(progress: number): ActivityStatus {
    if (progress >= 95) {
      return 'Completed';
    }
    if (progress >= 45) {
      return 'In Progress';
    }
    return 'Not Started';
  }

  protected rowLabel(rowId: 1 | 2 | 3 | 4 | 5): string {
    return this.rows.find((row) => row.id === rowId)?.label ?? '';
  }

  protected rowColor(rowId: 1 | 2 | 3 | 4 | 5): string {
    return this.rows.find((row) => row.id === rowId)?.color ?? '#d9d9d9';
  }

  protected statusColor(status: ActivityStatus): string {
    if (status === 'Completed') {
      return 'green';
    }
    if (status === 'In Progress') {
      return 'blue';
    }
    if (status === 'Blocked') {
      return 'red';
    }
    return 'default';
  }

  protected selectActivity(id: number): void {
    this.selectedActivityId.set(id);
  }

  protected openCreateActivityModal(): void {
    this.createActivityModalVisible.set(true);
  }

  protected closeCreateActivityModal(): void {
    this.createActivityModalVisible.set(false);
  }

  private loadNdrppActionItems(): void {
    this.http.get<NdrppActionItemsPayload>('data/NDRRP.json').subscribe((payload) => {
      const entries =
        payload.action_items_categories
          ?.flatMap((category) => category.identified_action_references ?? [])
          .filter((item) => item.number > 0) ?? [];

      const uniqueByNumber = new Map<number, string>();
      for (const entry of entries) {
        if (!uniqueByNumber.has(entry.number)) {
          uniqueByNumber.set(entry.number, entry.action);
        }
      }

      const options = Array.from(uniqueByNumber.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([number, action]) => ({ number, action }));

      this.ndrrpActionItems.set(options);

      const defaultAction = options[0]?.number ?? this.subActivityForm.controls.actionItemNo.value;
      this.subActivityForm.controls.actionItemNo.setValue(defaultAction);
    });
  }

  protected saveSubActivity(): void {
    this.message.info('Saving is disabled in demo version.');
    this.closeCreateActivityModal();
  }
}
