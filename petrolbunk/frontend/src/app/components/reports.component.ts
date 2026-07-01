import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { DailySummary, DateTotal, FuelType } from '../models/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>⬇️ Download Report</h2>
      <p class="muted">Export sales for a date range as Excel or PDF.</p>
      <div class="toolbar">
        <div>
          <label>From</label>
          <input type="date" [(ngModel)]="fromDate" />
        </div>
        <div>
          <label>To</label>
          <input type="date" [(ngModel)]="toDate" />
        </div>
        <button (click)="exportExcel()" [disabled]="downloading">
          {{ downloading ? 'Preparing…' : 'Download Excel' }}
        </button>
        <button (click)="exportPdf()" [disabled]="downloading">
          {{ downloading ? 'Preparing…' : 'Download PDF' }}
        </button>
      </div>
      <div *ngIf="exportError" class="error">{{ exportError }}</div>
    </div>

    <div class="card">
      <h2>📊 Daily Summary</h2>
      <div class="toolbar">
        <div>
          <label>Select date</label>
          <input type="date" [(ngModel)]="date" (change)="loadSummary()" />
        </div>
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>

      <table *ngIf="summary">
        <thead>
          <tr><th>Fuel Type</th><th>Total Litres</th><th>Total Amount (₹)</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of summary.fuelTypeTotals">
            <td><span class="fuel-tag" [ngClass]="'tag-' + t.fuelType">{{ label(t.fuelType) }}</span></td>
            <td>{{ t.totalLitres | number:'1.2-2' }}</td>
            <td>₹ {{ t.totalAmount | number:'1.2-2' }}</td>
          </tr>
          <tr class="totals-row">
            <td>Grand Total</td>
            <td>{{ summary.grandTotalLitres | number:'1.2-2' }}</td>
            <td class="grand">₹ {{ summary.grandTotalAmount | number:'1.2-2' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>🗂️ History</h2>
      <p class="muted">Past days with recorded sales. Tap a row to view its summary above.</p>
      <table *ngIf="history.length">
        <thead>
          <tr><th>Date</th><th>Total Litres</th><th>Total Amount (₹)</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let h of history" (click)="pick(h)" style="cursor:pointer;">
            <td>{{ h.date }}</td>
            <td>{{ h.grandTotalLitres | number:'1.2-2' }}</td>
            <td>₹ {{ h.grandTotalAmount | number:'1.2-2' }}</td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="!history.length" class="muted">No history yet. Save a day on the Daily Entry page.</p>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  date = new Date().toISOString().substring(0, 10);
  summary?: DailySummary;
  history: DateTotal[] = [];
  error = '';

  // Export date range defaults to the first of this month → today.
  fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().substring(0, 10);
  toDate = new Date().toISOString().substring(0, 10);
  downloading = false;
  exportError = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadSummary(); this.loadHistory(); }

  exportExcel(): void {
    this.runDownload(
      this.api.downloadExcel(this.fromDate, this.toDate),
      `Nandha_Sales_${this.fromDate}_to_${this.toDate}.xlsx`);
  }

  exportPdf(): void {
    this.runDownload(
      this.api.downloadPdf(this.fromDate, this.toDate),
      `Nandha_Sales_${this.fromDate}_to_${this.toDate}.pdf`);
  }

  private runDownload(obs: any, filename: string): void {
    if (this.fromDate > this.toDate) {
      this.exportError = "'From' date cannot be after 'To' date.";
      return;
    }
    this.exportError = '';
    this.downloading = true;
    obs.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloading = false;
      },
      error: () => {
        this.exportError = 'Could not generate the file. Is the backend running?';
        this.downloading = false;
      }
    });
  }

  loadSummary(): void {
    this.error = '';
    this.api.getDay(this.date).subscribe({
      next: s => this.summary = s,
      error: e => this.error = this.msg(e)
    });
  }

  loadHistory(): void {
    this.api.getHistory().subscribe({
      next: h => this.history = h,
      error: e => this.error = this.msg(e)
    });
  }

  pick(h: DateTotal): void {
    this.date = h.date;
    this.loadSummary();
  }

  label(t: FuelType): string {
    return t === 'POWER_PETROL' ? 'Power Petrol' : t.charAt(0) + t.slice(1).toLowerCase();
  }

  private msg(e: any): string {
    return e?.error?.message || 'Something went wrong. Is the backend running?';
  }
}
