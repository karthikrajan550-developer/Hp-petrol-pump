import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { DailySummary, PumpReading, FuelType } from '../models/models';

@Component({
  selector: 'app-daily-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>⛽ Daily Entry</h2>
      <div class="toolbar">
        <div>
          <label>Date</label>
          <input type="date" [(ngModel)]="date" (change)="load()" />
        </div>
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>
      <div *ngIf="message" class="success">{{ message }}</div>

      <table *ngIf="summary">
        <thead>
          <tr>
            <th>Pump</th><th>Opening</th><th>Closing</th>
            <th>Litres</th><th>₹/L</th><th>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of summary.pumps">
            <td>
              <span class="fuel-tag" [ngClass]="'tag-' + row.fuelType">{{ short(row.fuelType) }}</span>
              {{ row.pumpName }}
            </td>
            <td>{{ row.openingReading | number:'1.2-2' }}</td>
            <td class="input-cell">
              <input type="number" step="0.01" [min]="row.openingReading"
                     [(ngModel)]="row.closingReading"
                     (ngModelChange)="recalc(row)" />
            </td>
            <td>{{ liveLitres(row) | number:'1.2-2' }}</td>
            <td>{{ row.pricePerLitre | number:'1.2-2' }}</td>
            <td>₹ {{ liveAmount(row) | number:'1.2-2' }}</td>
          </tr>
        </tbody>
        <tbody>
          <tr class="totals-row">
            <td>Grand Total</td><td></td><td></td>
            <td>{{ totalLitres() | number:'1.2-2' }}</td>
            <td></td>
            <td class="grand">₹ {{ totalAmount() | number:'1.2-2' }}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:14px;">
        <button (click)="save()" [disabled]="saving">{{ saving ? 'Saving…' : 'Save Day' }}</button>
      </div>
    </div>
  `
})
export class DailyEntryComponent implements OnInit {
  date = this.today();
  summary?: DailySummary;
  error = '';
  message = '';
  saving = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.error = ''; this.message = '';
    this.api.getDay(this.date).subscribe({
      next: s => this.summary = s,
      error: e => this.error = this.msg(e)
    });
  }

  recalc(_row: PumpReading): void { /* live getters handle display */ }

  liveLitres(row: PumpReading): number {
    if (row.closingReading == null) return 0;
    const v = row.closingReading - row.openingReading;
    return v > 0 ? v : 0;
  }

  liveAmount(row: PumpReading): number {
    return this.liveLitres(row) * row.pricePerLitre;
  }

  totalLitres(): number {
    return this.summary ? this.summary.pumps.reduce((s, r) => s + this.liveLitres(r), 0) : 0;
  }

  totalAmount(): number {
    return this.summary ? this.summary.pumps.reduce((s, r) => s + this.liveAmount(r), 0) : 0;
  }

  save(): void {
    if (!this.summary) return;
    // Client-side guard mirroring the backend rule.
    for (const r of this.summary.pumps) {
      if (r.closingReading != null && r.closingReading < r.openingReading) {
        this.error = `Closing reading for ${r.pumpName} cannot be less than opening (${r.openingReading}).`;
        return;
      }
    }
    this.error = ''; this.message = ''; this.saving = true;
    this.api.saveDay({
      date: this.date,
      readings: this.summary.pumps.map(r => ({ pumpId: r.pumpId, closingReading: r.closingReading }))
    }).subscribe({
      next: s => { this.summary = s; this.saving = false; this.message = 'Saved successfully.'; },
      error: e => { this.saving = false; this.error = this.msg(e); }
    });
  }

  short(t: FuelType): string {
    return t === 'PETROL' ? 'P' : t === 'DIESEL' ? 'D' : 'PP';
  }

  private today(): string {
    return new Date().toISOString().substring(0, 10);
  }

  private msg(e: any): string {
    return e?.error?.message || 'Something went wrong. Is the backend running?';
  }
}
