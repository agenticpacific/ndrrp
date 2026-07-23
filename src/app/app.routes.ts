import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then((m) => m.Home), title: 'Fiji NDRRP M&E Platform' },
  { path: 'home', loadComponent: () => import('./home/home').then((m) => m.Home), title: 'Fiji NDRRP M&E Platform' },
  { path: 'activity', loadComponent: () => import('./activity/activity').then((m) => m.Activity) },
  { path: 'outcome', loadComponent: () => import('./outcome/outcome').then((m) => m.Outcome) },
  { path: 'report', loadComponent: () => import('./report/report').then((m) => m.Report) },
  { path: 'sendai', loadComponent: () => import('./frameworks/sendai/sendai').then((m) => m.Sendai) },
  { path: 'frdp', loadComponent: () => import('./frameworks/frdp/frdp').then((m) => m.Frdp) },
  { path: 'ndp', loadComponent: () => import('./frameworks/ndp/ndp').then((m) => m.Ndp) },
  { path: 'ndrrp', loadComponent: () => import('./frameworks/ndrrp/ndrrp').then((m) => m.Ndrrp) },
];
