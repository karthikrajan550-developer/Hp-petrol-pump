import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { MonthlySummary, DailySummary, FuelType } from '../models/models';

@Component({
  selector: 'app-monthly',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2><i class="hd">&#128197;</i> Monthly Data</h2>
      <p class="muted">Saved sales for a full month, with totals you can re-derive any
        time. Expand a day to see its full pump-by-pump breakdown.</p>

      <div class="toolbar">
        <div>
          <label>Month</label>
          <select [(ngModel)]="month" (change)="load()">
            <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
          </select>
        </div>
        <div>
          <label>Year</label>
          <select [(ngModel)]="year" (change)="load()">
            <option *ngFor="let y of years" [value]="y">{{ y }}</option>
          </select>
        </div>
        <button class="ghost" (click)="loadCurrent()">This Month</button>
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>

      <ng-container *ngIf="summary">
        <div class="metrics">
          <div class="metric">
            <div class="m-label">Total Litres ({{ summary.monthLabel }})</div>
            <div class="m-value">{{ summary.grandTotalLitres | number:'1.2-2' }} L</div>
          </div>
          <div class="metric">
            <div class="m-label">Total Revenue</div>
            <div class="m-value green">&#8377; {{ summary.grandTotalAmount | number:'1.2-2' }}</div>
          </div>
          <div class="metric">
            <div class="m-label">Days Recorded</div>
            <div class="m-value">{{ summary.days.length }}</div>
          </div>
        </div>

        <h2 style="font-size:15px;">By Fuel Type</h2>
        <table>
          <thead>
            <tr><th>Fuel Type</th><th>Litres</th><th>Amount (&#8377;)</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of summary.fuelTypeTotals">
              <td><span class="fuel-tag" [ngClass]="'tag-' + t.fuelType">{{ label(t.fuelType) }}</span></td>
              <td>{{ t.totalLitres | number:'1.2-2' }}</td>
              <td>&#8377; {{ t.totalAmount | number:'1.2-2' }}</td>
            </tr>
            <tr class="totals-row">
              <td>Grand Total</td>
              <td>{{ summary.grandTotalLitres | number:'1.2-2' }}</td>
              <td class="grand">&#8377; {{ summary.grandTotalAmount | number:'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>

        <h2 style="font-size:15px; margin-top:20px;">Daily Breakdown</h2>
        <table *ngIf="summary.days.length">
          <thead>
            <tr><th>Date</th><th>Litres</th><th>Amount (&#8377;)</th><th></th></tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let d of summary.days">
              <tr>
                <td>{{ d.date }}</td>
                <td>{{ d.grandTotalLitres | number:'1.2-2' }}</td>
                <td>&#8377; {{ d.grandTotalAmount | number:'1.2-2' }}</td>
                <td style="text-align:center;">
                  <button class="expand-btn" (click)="toggle(d.date)">
                    {{ expanded === d.date ? '&#9650; Hide' : '&#9660; View' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="expanded === d.date" class="day-detail">
                <td colspan="4">
                  <div *ngIf="loadingDay" class="muted">Loading breakdown&hellip;</div>
                  <table *ngIf="!loadingDay && dayDetail" class="inner-table">
                    <thead>
                      <tr>
                        <th>Pump</th><th>Opening</th><th>Closing</th>
                        <th>Litres</th><th>&#8377;/L</th><th>Amount (&#8377;)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let p of dayDetail.pumps">
                        <td>
                          <span class="fuel-tag" [ngClass]="'tag-' + p.fuelType">{{ short(p.fuelType) }}</span>
                          {{ p.pumpName }}
                        </td>
                        <td>{{ p.openingReading | number:'1.2-2' }}</td>
                        <td>{{ p.closingReading | number:'1.2-2' }}</td>
                        <td>{{ p.litresSold | number:'1.2-2' }}</td>
                        <td>{{ p.pricePerLitre | number:'1.2-2' }}</td>
                        <td>&#8377; {{ p.amount | number:'1.2-2' }}</td>
                      </tr>
                      <tr class="totals-row">
                        <td>Total</td><td></td><td></td>
                        <td>{{ dayDetail.grandTotalLitres | number:'1.2-2' }}</td>
                        <td></td>
                        <td class="grand">&#8377; {{ dayDetail.grandTotalAmount | number:'1.2-2' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
        <p *ngIf="!summary.days.length" class="muted">No sales recorded for this month yet.</p>
      </ng-container>
    </div>
  `
})
export class MonthlyComponent implements OnInit {
  months = ['January','February','March','April','May','June',
            'July','August','September','October','November','December'];
  years: number[] = [];
  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();
  summary?: MonthlySummary;
  expanded: string | null = null;
  dayDetail?: DailySummary;
  loadingDay = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    const current = new Date().getFullYear();
    for (let y = current; y >= current - 5; y--) this.years.push(y);
    this.load();
  }

  load(): void {
    this.error = '';
    this.expanded = null;
    this.dayDetail = undefined;
    this.api.getMonth(Number(this.year), Number(this.month)).subscribe({
      next: s => this.summary = s,
      error: e => this.error = this.msg(e)
    });
  }

  loadCurrent(): void {
    this.month = new Date().getMonth() + 1;
    this.year = new Date().getFullYear();
    this.load();
  }

  toggle(date: string): void {
    if (this.expanded === date) {
      this.expanded = null;
      this.dayDetail = undefined;
      return;
    }
    this.expanded = date;
    this.dayDetail = undefined;
    this.loadingDay = true;
    this.api.getDay(date).subscribe({
      next: d => { this.dayDetail = d; this.loadingDay = false; },
      error: e => { this.error = this.msg(e); this.loadingDay = false; }
    });
  }

  label(t: FuelType): string {
    return t === 'POWER_PETROL' ? 'Power Petrol' : t.charAt(0) + t.slice(1).toLowerCase();
  }

  short(t: FuelType): string {
    return t === 'PETROL' ? 'P' : t === 'DIESEL' ? 'D' : 'PP';
  }

  private msg(e: any): string {
    return e?.error?.message || 'Something went wrong. Is the backend running?';
  }
}
