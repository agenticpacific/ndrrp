import { NgOptimizedImage, UpperCasePipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { DataService } from '../data-service';
import { inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';



import type { Alignment, FrameworksAlignment } from '../models/frameworks-alignment';

@Component({
  selector: 'app-home',
  imports: [
    NzCardModule,
    NzDividerModule,
    NzTableModule,
    NzCollapseModule,
    UpperCasePipe,
    RouterLink,
    NgOptimizedImage,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  service: DataService = inject(DataService);

  frameworksAlignment = signal<FrameworksAlignment[]>([]);
  frameworkData = computed(() => this.frameworksAlignment()[0]);
  frameworks = computed(() => this.frameworkData()?.frameworks ?? []);
  alignmentThemes = computed(() => this.frameworkData()?.alignmentThemes ?? []);
  alignmentThemesView = computed(() =>
    this.alignmentThemes().map((theme) => ({
      ...theme,
      alignments: theme.alignments.map((alignment) => ({
        ...alignment,
        titles: this.alignmentTitles(alignment),
        descriptions: this.alignmentDescriptions(alignment),
      })),
    })),
  );
  sendaiTargetsAlignment = computed(() => this.frameworkData()?.sendaiTargetsAlignment ?? []);

  constructor() {
    this.frameworksAlignment = this.service.getFrameworksAlignment();
  }

  alignmentTitles(alignment: Alignment): string[] {
    return [
      alignment.priorityTitle,
      alignment.goalTitle,
      alignment.strategyTitle,
      ...(alignment.goalTitles ?? []),
      ...(alignment.strategyTitles ?? []),
      ...(alignment.guidingPrincipleTitles ?? []),
      ...(alignment.focusAreas ?? []).map((focusArea) => `Focus area: ${focusArea}`),
    ].filter((value): value is string => Boolean(value));
  }

  alignmentDescriptions(alignment: Alignment): string[] {
    return alignment.elements.flatMap((element) => [
      ...(element.text ? [element.text] : []),
      ...(element.items ?? []),
      ...(element.keyItems ?? []),
    ]);
  }
}
