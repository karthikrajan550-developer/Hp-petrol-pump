import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Customer, Vehicle, VehicleLedger, FuelType, CreditReport } from '../models/models';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>📄 Credit Report — All Customers</h2>
      <p class="muted">Total fuel credit outstanding across every customer.</p>
      <div class="metrics" *ngIf="creditReport">
        <div class="metric"><div class="m-label">Total Credit Given</div><div class="m-value">₹ {{ creditReport.grandTotalCredit | number:'1.2-2' }}</div></div>
        <div class="metric"><div class="m-label">Total Paid</div><div class="m-value">₹ {{ creditReport.grandTotalPaid | number:'1.2-2' }}</div></div>
        <div class="metric"><div class="m-label">Total Outstanding</div><div class="m-value green">₹ {{ creditReport.grandTotalOutstanding | number:'1.2-2' }}</div></div>
      </div>
      <div class="toolbar">
        <button class="ghost" (click)="downloadReportExcel()">Download Excel</button>
        <button class="ghost" (click)="downloadReportPdf()">Download PDF</button>
      </div>
      <table *ngIf="creditReport && creditReport.customers.length">
        <thead>
          <tr><th>Company</th><th>Vehicles</th><th>Credit</th><th>Paid</th><th>Outstanding (₹)</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of creditReport.customers">
            <td>{{ row.companyName }}</td>
            <td>{{ row.vehicleCount }}</td>
            <td>₹ {{ row.totalCredit | number:'1.2-2' }}</td>
            <td>₹ {{ row.totalPaid | number:'1.2-2' }}</td>
            <td class="grand">₹ {{ row.outstanding | number:'1.2-2' }}</td>
          </tr>
          <tr class="totals-row">
            <td>Grand Total</td>
            <td></td>
            <td>₹ {{ creditReport.grandTotalCredit | number:'1.2-2' }}</td>
            <td>₹ {{ creditReport.grandTotalPaid | number:'1.2-2' }}</td>
            <td class="grand">₹ {{ creditReport.grandTotalOutstanding | number:'1.2-2' }}</td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="creditReport && !creditReport.customers.length" class="muted">No customers yet.</p>
    </div>

    <div class="card">
      <h2>👥 Customers</h2>
      <p class="muted">Create customers, add their vehicles, and track fuel credit per vehicle.</p>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="toolbar">
        <div style="flex:1;min-width:180px;">
          <label>New customer (company name)</label>
          <input type="text" [(ngModel)]="newCompany" placeholder="e.g. Sri Travels" />
        </div>
        <div>
          <label>Contact (optional)</label>
          <input type="text" [(ngModel)]="newContact" />
        </div>
        <div>
          <label>Phone (optional)</label>
          <input type="text" [(ngModel)]="newPhone" />
        </div>
        <button (click)="createCustomer()">Create Customer</button>
      </div>

      <div class="toolbar" *ngIf="customers.length" style="border-top:1px solid rgba(10,61,98,0.1);padding-top:14px;">
        <div style="flex:1;min-width:200px;">
          <label>🔍 Search customer</label>
          <input type="text" [(ngModel)]="search" placeholder="Type a company name…" />
        </div>
        <div>
          <label>Sort by</label>
          <select [(ngModel)]="sortBy">
            <option value="name">Name (A–Z)</option>
            <option value="balance">Highest outstanding</option>
          </select>
        </div>
        <div>
          <label>&nbsp;</label>
          <button class="ghost" [class.active-filter]="onlyDue" (click)="onlyDue = !onlyDue">
            {{ onlyDue ? '✓ ' : '' }}Only with balance
          </button>
        </div>
      </div>
      <p class="muted" *ngIf="customers.length">
        Showing {{ filteredCustomers().length }} of {{ customers.length }} customers.
      </p>

      <table *ngIf="customers.length">
        <thead>
          <tr><th>Company</th><th>Contact</th><th>Phone</th><th>Outstanding (₹)</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of filteredCustomers()">
            <ng-container *ngIf="editCustId !== c.id">
              <td (click)="selectCustomer(c)" style="cursor:pointer;">{{ c.companyName }}</td>
              <td class="muted">{{ c.contactPerson || '-' }}</td>
              <td class="muted">{{ c.phone || '-' }}</td>
              <td>₹ {{ c.totalOutstanding | number:'1.2-2' }}</td>
              <td style="text-align:center;white-space:nowrap;">
                <button class="expand-btn" (click)="selectCustomer(c)">Open ▸</button>
                <button class="expand-btn" (click)="startEditCustomer(c)">Edit</button>
                <button class="expand-btn" (click)="deleteCustomer(c)">Delete</button>
              </td>
            </ng-container>
            <ng-container *ngIf="editCustId === c.id">
              <td><input type="text" [(ngModel)]="editCompany" /></td>
              <td><input type="text" [(ngModel)]="editContact" /></td>
              <td><input type="text" [(ngModel)]="editPhone" /></td>
              <td>₹ {{ c.totalOutstanding | number:'1.2-2' }}</td>
              <td style="text-align:center;white-space:nowrap;">
                <button class="expand-btn" (click)="saveEditCustomer(c)">Save</button>
                <button class="expand-btn" (click)="cancelEditCustomer()">Cancel</button>
              </td>
            </ng-container>
          </tr>
        </tbody>
      </table>
      <p *ngIf="!customers.length" class="muted">No customers yet. Create one above.</p>
      <p *ngIf="customers.length && !filteredCustomers().length" class="muted">
        No customers match your search.
      </p>
    </div>

    <!-- Selected customer detail -->
    <div class="card" *ngIf="selected">
      <h2>🏢 {{ selected.companyName }}</h2>
      <div class="toolbar">
        <div class="metric" style="min-width:180px;">
          <div class="m-label">Total Outstanding</div>
          <div class="m-value">₹ {{ selected.totalOutstanding | number:'1.2-2' }}</div>
        </div>
        <button class="ghost" (click)="downloadCustomerExcel()">Download Excel</button>
        <button class="ghost" (click)="downloadCustomerPdf()">Download PDF</button>
      </div>

      <h2 style="font-size:15px;margin-top:12px;">Add Vehicle</h2>
      <div class="toolbar">
        <div>
          <label>Vehicle number</label>
          <input type="text" [(ngModel)]="newVehNumber" placeholder="TN-01-AB-1234" />
        </div>
        <div>
          <label>Fuel type</label>
          <select [(ngModel)]="newVehFuel">
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="POWER_PETROL">Power Petrol</option>
          </select>
        </div>
        <div>
          <label>Description (optional)</label>
          <input type="text" [(ngModel)]="newVehDesc" placeholder="Lorry" />
        </div>
        <button (click)="addVehicle()">Add Vehicle</button>
      </div>

      <table *ngIf="selected.vehicles && selected.vehicles.length">
        <thead>
          <tr><th>Vehicle</th><th>Fuel</th><th>Credit</th><th>Paid</th><th>Balance (₹)</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let v of selected.vehicles">
            <ng-container *ngIf="editVehId !== v.id">
              <td>{{ v.vehicleNumber }}</td>
              <td><span class="fuel-tag" [ngClass]="'tag-' + v.fuelType">{{ label(v.fuelType) }}</span></td>
              <td>₹ {{ v.totalCredit | number:'1.2-2' }}</td>
              <td>₹ {{ v.totalPaid | number:'1.2-2' }}</td>
              <td class="grand">₹ {{ v.balance | number:'1.2-2' }}</td>
              <td style="text-align:center;white-space:nowrap;">
                <button class="expand-btn" (click)="openLedger(v)">Ledger ▸</button>
                <button class="expand-btn" (click)="startEditVehicle(v)">Edit</button>
                <button class="expand-btn" (click)="deleteVehicle(v)">Delete</button>
              </td>
            </ng-container>
            <ng-container *ngIf="editVehId === v.id">
              <td><input type="text" [(ngModel)]="editVehNumber" style="width:120px;" /></td>
              <td>
                <select [(ngModel)]="editVehFuel">
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="POWER_PETROL">Power Petrol</option>
                </select>
              </td>
              <td>₹ {{ v.totalCredit | number:'1.2-2' }}</td>
              <td>₹ {{ v.totalPaid | number:'1.2-2' }}</td>
              <td class="grand">₹ {{ v.balance | number:'1.2-2' }}</td>
              <td style="text-align:center;white-space:nowrap;">
                <button class="expand-btn" (click)="saveEditVehicle(v)">Save</button>
                <button class="expand-btn" (click)="cancelEditVehicle()">Cancel</button>
              </td>
            </ng-container>
          </tr>
        </tbody>
      </table>
      <p *ngIf="selected.vehicles && !selected.vehicles.length" class="muted">No vehicles yet. Add one above.</p>
    </div>

    <!-- Vehicle ledger -->
    <div class="card" *ngIf="ledger">
      <h2>🚛 {{ ledger.vehicle.vehicleNumber }}
        <span class="fuel-tag" [ngClass]="'tag-' + ledger.vehicle.fuelType">{{ label(ledger.vehicle.fuelType) }}</span>
      </h2>
      <p class="muted">Today's {{ label(ledger.vehicle.fuelType) }} price: ₹ {{ ledger.vehicle.currentPrice | number:'1.2-2' }}/L</p>

      <div class="metrics">
        <div class="metric"><div class="m-label">Total Credit</div><div class="m-value">₹ {{ ledger.totalCredit | number:'1.2-2' }}</div></div>
        <div class="metric"><div class="m-label">Total Paid</div><div class="m-value">₹ {{ ledger.totalPaid | number:'1.2-2' }}</div></div>
        <div class="metric"><div class="m-label">Balance</div><div class="m-value green">₹ {{ ledger.balance | number:'1.2-2' }}</div></div>
      </div>

      <div class="toolbar">
        <div>
          <label>Add credit — litres</label>
          <input type="number" step="0.01" [(ngModel)]="creditLitres" />
        </div>
        <div>
          <label>Date</label>
          <input type="date" [(ngModel)]="creditDate" />
        </div>
        <div>
          <label>Note</label>
          <input type="text" [(ngModel)]="creditNote" />
        </div>
        <button (click)="addCredit()">Add Credit</button>
      </div>
      <p class="muted" *ngIf="creditLitres > 0">
        ≈ ₹ {{ (creditLitres * ledger.vehicle.currentPrice) | number:'1.2-2' }} at today's price
      </p>

      <div class="toolbar">
        <div>
          <label>Record payment — amount ₹</label>
          <input type="number" step="0.01" [(ngModel)]="payAmount" />
        </div>
        <div>
          <label>Date</label>
          <input type="date" [(ngModel)]="payDate" />
        </div>
        <div>
          <label>Note</label>
          <input type="text" [(ngModel)]="payNote" />
        </div>
        <button (click)="addPayment()">Record Payment</button>
      </div>

      <h2 style="font-size:15px;margin-top:16px;">Ledger</h2>
      <table *ngIf="ledger.entries.length">
        <thead>
          <tr><th>Date</th><th>Type</th><th>Litres</th><th>₹/L</th><th>Amount</th><th>Balance</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of ledger.entries">
            <ng-container *ngIf="editingId !== e.id">
              <td>{{ e.entryDate }}</td>
              <td>{{ e.entryType === 'CREDIT' ? 'Credit' : 'Payment' }}</td>
              <td>{{ e.litres != null ? (e.litres | number:'1.2-2') : '-' }}</td>
              <td>{{ e.pricePerLitre != null ? (e.pricePerLitre | number:'1.2-2') : '-' }}</td>
              <td>₹ {{ e.amount | number:'1.2-2' }}</td>
              <td>₹ {{ e.runningBalance | number:'1.2-2' }}</td>
              <td style="text-align:center;white-space:nowrap;">
                <button class="expand-btn" (click)="startEdit(e)">Edit</button>
                <button class="expand-btn" (click)="deleteEntry(e.id)">Delete</button>
              </td>
            </ng-container>
            <ng-container *ngIf="editingId === e.id">
              <td><input type="date" [(ngModel)]="editDate" /></td>
              <td>{{ e.entryType === 'CREDIT' ? 'Credit' : 'Payment' }}</td>
              <td>
                <input *ngIf="e.entryType === 'CREDIT'" type="number" step="0.01" [(ngModel)]="editLitres" style="width:80px;" />
                <span *ngIf="e.entryType === 'PAYMENT'">-</span>
              </td>
              <td>{{ e.pricePerLitre != null ? (e.pricePerLitre | number:'1.2-2') : '-' }}</td>
              <td>
                <input *ngIf="e.entryType === 'PAYMENT'" type="number" step="0.01" [(ngModel)]="editAmount" style="width:90px;" />
                <span *ngIf="e.entryType === 'CREDIT'" class="muted">auto</span>
              </td>
              <td></td>
              <td style="text-align:center;white-space:nowrap;">
                <button class="expand-btn" (click)="saveEdit(e)">Save</button>
                <button class="expand-btn" (click)="cancelEdit()">Cancel</button>
              </td>
            </ng-container>
          </tr>
          <tr class="totals-row">
            <td>Balance</td><td></td><td></td><td></td><td></td>
            <td class="grand">₹ {{ ledger.balance | number:'1.2-2' }}</td><td></td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="!ledger.entries.length" class="muted">No entries yet. Add credit or a payment above.</p>
    </div>
  `
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  selected?: Customer;
  ledger?: VehicleLedger;
  creditReport?: CreditReport;
  error = '';

  // Search / sort / filter for the customer list
  search = '';
  sortBy: 'name' | 'balance' = 'name';
  onlyDue = false;

  newCompany = ''; newContact = ''; newPhone = '';
  newVehNumber = ''; newVehFuel: FuelType = 'PETROL'; newVehDesc = '';

  creditLitres = 0; creditDate = this.today(); creditNote = '';
  payAmount = 0; payDate = this.today(); payNote = '';

  editingId: number | null = null;
  editDate = ''; editLitres = 0; editAmount = 0;

  // Inline edit state for customers and vehicles
  editCustId: number | null = null;
  editCompany = ''; editContact = ''; editPhone = '';
  editVehId: number | null = null;
  editVehNumber = ''; editVehFuel: FuelType = 'PETROL';

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  filteredCustomers(): Customer[] {
    const term = this.search.trim().toLowerCase();
    let list = this.customers.filter(c => {
      const matches = !term ||
        c.companyName.toLowerCase().includes(term) ||
        (c.contactPerson || '').toLowerCase().includes(term) ||
        (c.phone || '').toLowerCase().includes(term);
      const due = !this.onlyDue || (c.totalOutstanding && c.totalOutstanding > 0);
      return matches && due;
    });
    if (this.sortBy === 'name') {
      list = list.slice().sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else {
      list = list.slice().sort((a, b) => (b.totalOutstanding || 0) - (a.totalOutstanding || 0));
    }
    return list;
  }

  load(): void {
    this.api.listCustomers().subscribe({
      next: c => this.customers = c,
      error: e => this.error = this.msg(e)
    });
    this.api.getCreditReport().subscribe({
      next: r => this.creditReport = r,
      error: e => this.error = this.msg(e)
    });
  }

  downloadReportExcel(): void {
    this.api.downloadCreditReportExcel().subscribe({
      next: b => this.save(b, 'Credit_Report.xlsx'),
      error: e => this.error = this.msg(e)
    });
  }

  downloadReportPdf(): void {
    this.api.downloadCreditReportPdf().subscribe({
      next: b => this.save(b, 'Credit_Report.pdf'),
      error: e => this.error = this.msg(e)
    });
  }

  createCustomer(): void {
    if (!this.newCompany.trim()) { this.error = 'Enter a company name.'; return; }
    this.error = '';
    this.api.createCustomer({
      companyName: this.newCompany, contactPerson: this.newContact, phone: this.newPhone
    }).subscribe({
      next: () => { this.newCompany = this.newContact = this.newPhone = ''; this.load(); },
      error: e => this.error = this.msg(e)
    });
  }

  selectCustomer(c: Customer): void {
    this.ledger = undefined;
    this.api.getCustomer(c.id).subscribe({
      next: full => this.selected = full,
      error: e => this.error = this.msg(e)
    });
  }

  startEditCustomer(c: Customer): void {
    this.editCustId = c.id;
    this.editCompany = c.companyName;
    this.editContact = c.contactPerson || '';
    this.editPhone = c.phone || '';
  }

  cancelEditCustomer(): void { this.editCustId = null; }

  saveEditCustomer(c: Customer): void {
    if (!this.editCompany.trim()) { this.error = 'Company name cannot be empty.'; return; }
    this.error = '';
    this.api.updateCustomer(c.id, {
      companyName: this.editCompany, contactPerson: this.editContact, phone: this.editPhone
    }).subscribe({
      next: () => {
        this.editCustId = null;
        this.load();
        if (this.selected && this.selected.id === c.id) this.selectCustomer(c);
      },
      error: e => this.error = this.msg(e)
    });
  }

  deleteCustomer(c: Customer): void {
    if (!confirm(`Delete customer "${c.companyName}" and all its vehicles and ledger history? This cannot be undone.`)) return;
    this.error = '';
    this.api.deleteCustomer(c.id).subscribe({
      next: () => {
        if (this.selected && this.selected.id === c.id) { this.selected = undefined; this.ledger = undefined; }
        this.load();
      },
      error: e => this.error = this.msg(e)
    });
  }

  startEditVehicle(v: Vehicle): void {
    this.editVehId = v.id;
    this.editVehNumber = v.vehicleNumber;
    this.editVehFuel = v.fuelType;
  }

  cancelEditVehicle(): void { this.editVehId = null; }

  saveEditVehicle(v: Vehicle): void {
    if (!this.editVehNumber.trim()) { this.error = 'Vehicle number cannot be empty.'; return; }
    if (!this.selected) return;
    this.error = '';
    this.api.updateVehicle(v.id, {
      customerId: this.selected.id, vehicleNumber: this.editVehNumber, fuelType: this.editVehFuel
    }).subscribe({
      next: () => { this.editVehId = null; this.selectCustomer(this.selected!); },
      error: e => this.error = this.msg(e)
    });
  }

  deleteVehicle(v: Vehicle): void {
    if (!confirm(`Delete vehicle "${v.vehicleNumber}" and its entire ledger? This cannot be undone.`)) return;
    this.error = '';
    this.api.deleteVehicle(v.id).subscribe({
      next: () => {
        if (this.ledger && this.ledger.vehicle.id === v.id) this.ledger = undefined;
        if (this.selected) this.selectCustomer(this.selected);
      },
      error: e => this.error = this.msg(e)
    });
  }

  addVehicle(): void {
    if (!this.selected) return;
    if (!this.newVehNumber.trim()) { this.error = 'Enter a vehicle number.'; return; }
    this.error = '';
    this.api.addVehicle({
      customerId: this.selected.id, vehicleNumber: this.newVehNumber,
      fuelType: this.newVehFuel, description: this.newVehDesc
    }).subscribe({
      next: () => { this.newVehNumber = ''; this.newVehDesc = ''; this.selectCustomer(this.selected!); },
      error: e => this.error = this.msg(e)
    });
  }

  openLedger(v: Vehicle): void {
    this.api.getVehicleLedger(v.id).subscribe({
      next: l => this.ledger = l,
      error: e => this.error = this.msg(e)
    });
  }

  addCredit(): void {
    if (!this.ledger) return;
    if (!(this.creditLitres > 0)) { this.error = 'Enter litres greater than 0.'; return; }
    this.error = '';
    this.api.addCredit({
      vehicleId: this.ledger.vehicle.id, litres: this.creditLitres,
      entryDate: this.creditDate, note: this.creditNote
    }).subscribe({
      next: l => { this.ledger = l; this.creditLitres = 0; this.creditNote = ''; this.refreshSelected(); },
      error: e => this.error = this.msg(e)
    });
  }

  addPayment(): void {
    if (!this.ledger) return;
    if (!(this.payAmount > 0)) { this.error = 'Enter a payment amount greater than 0.'; return; }
    this.error = '';
    this.api.addPayment({
      vehicleId: this.ledger.vehicle.id, amount: this.payAmount,
      entryDate: this.payDate, note: this.payNote
    }).subscribe({
      next: l => { this.ledger = l; this.payAmount = 0; this.payNote = ''; this.refreshSelected(); },
      error: e => this.error = this.msg(e)
    });
  }

  startEdit(e: any): void {
    this.editingId = e.id;
    this.editDate = e.entryDate;
    this.editLitres = e.litres || 0;
    this.editAmount = e.amount || 0;
  }

  cancelEdit(): void { this.editingId = null; }

  saveEdit(e: any): void {
    const body: any = { entryDate: this.editDate };
    if (e.entryType === 'CREDIT') body.litres = this.editLitres;
    else body.amount = this.editAmount;
    this.api.updateEntry(e.id, body).subscribe({
      next: l => { this.ledger = l; this.editingId = null; this.refreshSelected(); },
      error: err => this.error = this.msg(err)
    });
  }

  deleteEntry(id: number): void {
    this.api.deleteEntry(id).subscribe({
      next: l => { this.ledger = l; this.refreshSelected(); },
      error: e => this.error = this.msg(e)
    });
  }

  downloadCustomerExcel(): void {
    if (!this.selected) return;
    this.api.downloadCustomerExcel(this.selected.id).subscribe({
      next: b => this.save(b, `Customer_${this.selected!.companyName}.xlsx`),
      error: e => this.error = this.msg(e)
    });
  }

  downloadCustomerPdf(): void {
    if (!this.selected) return;
    this.api.downloadCustomerPdf(this.selected.id).subscribe({
      next: b => this.save(b, `Customer_${this.selected!.companyName}.pdf`),
      error: e => this.error = this.msg(e)
    });
  }

  private refreshSelected(): void {
    if (this.selected) this.selectCustomerKeepLedger(this.selected.id);
  }

  private selectCustomerKeepLedger(id: number): void {
    this.api.getCustomer(id).subscribe({ next: full => this.selected = full });
    this.load();
  }

  private save(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    window.URL.revokeObjectURL(url);
  }

  label(t: FuelType): string {
    return t === 'POWER_PETROL' ? 'Power Petrol' : t.charAt(0) + t.slice(1).toLowerCase();
  }

  private today(): string { return new Date().toISOString().substring(0, 10); }

  private msg(e: any): string {
    return e?.error?.message || 'Something went wrong. Is the backend running?';
  }
}
