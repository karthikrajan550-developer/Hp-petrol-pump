import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { FuelPrice, FuelType } from '../models/models';

@Component({
  selector: 'app-price-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>💰 Fuel Price Settings</h2>
      <p class="muted">Set the price per litre for each fuel. Editing creates a new
        price effective today; past days keep their original price.</p>

      <div *ngIf="error" class="error">{{ error }}</div>
      <div *ngIf="message" class="success">{{ message }}</div>

      <table>
        <thead>
          <tr><th>Fuel</th><th>Price (₹/L)</th><th>Effective From</th><th>Last Updated</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of prices">
            <td><span class="fuel-tag" [ngClass]="'tag-' + p.fuelType">{{ label(p.fuelType) }}</span></td>
            <td class="input-cell">
              <input type="number" step="0.01" min="0" [(ngModel)]="p.pricePerLitre" />
            </td>
            <td>{{ p.effectiveFrom }}</td>
            <td class="muted">{{ p.lastUpdated | date:'dd MMM yyyy, HH:mm' }}</td>
            <td><button (click)="save(p)">Save</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class PriceSettingsComponent implements OnInit {
  prices: FuelPrice[] = [];
  error = '';
  message = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getPrices().subscribe({
      next: p => this.prices = p,
      error: e => this.error = this.msg(e)
    });
  }

  save(p: FuelPrice): void {
    this.error = ''; this.message = '';
    this.api.updatePrice({ fuelType: p.fuelType, pricePerLitre: p.pricePerLitre }).subscribe({
      next: () => { this.message = `${this.label(p.fuelType)} price updated.`; this.load(); },
      error: e => this.error = this.msg(e)
    });
  }

  label(t: FuelType): string {
    return t === 'POWER_PETROL' ? 'Power Petrol' : t.charAt(0) + t.slice(1).toLowerCase();
  }

  private msg(e: any): string {
    return e?.error?.message || 'Something went wrong. Is the backend running?';
  }
}
