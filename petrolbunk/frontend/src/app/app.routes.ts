import { Routes } from '@angular/router';
import { DailyEntryComponent } from './components/daily-entry.component';
import { ReportsComponent } from './components/reports.component';
import { MonthlyComponent } from './components/monthly.component';
import { PriceSettingsComponent } from './components/price-settings.component';
import { CustomersComponent } from './components/customers.component';

export const routes: Routes = [
  { path: '', redirectTo: 'entry', pathMatch: 'full' },
  { path: 'entry', component: DailyEntryComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'monthly', component: MonthlyComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'prices', component: PriceSettingsComponent },
  { path: '**', redirectTo: 'entry' }
];
