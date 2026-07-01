import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  FuelPrice, UpdatePriceRequest, DailySummary,
  SaveReadingsRequest, DateTotal, MonthlySummary,
  FuelType, Customer, Vehicle, VehicleLedger, CreditReport
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  getPrices(): Observable<FuelPrice[]> {
    return this.http.get<FuelPrice[]>(`${this.base}/prices`);
  }

  updatePrice(req: UpdatePriceRequest): Observable<FuelPrice> {
    return this.http.put<FuelPrice>(`${this.base}/prices`, req);
  }

  getDay(date: string): Observable<DailySummary> {
    return this.http.get<DailySummary>(`${this.base}/readings/${date}`);
  }

  saveDay(req: SaveReadingsRequest): Observable<DailySummary> {
    return this.http.post<DailySummary>(`${this.base}/readings`, req);
  }

  getHistory(): Observable<DateTotal[]> {
    return this.http.get<DateTotal[]>(`${this.base}/readings/history`);
  }

  getMonth(year?: number, month?: number): Observable<MonthlySummary> {
    const y = year ?? 0;
    const m = month ?? 0;
    return this.http.get<MonthlySummary>(`${this.base}/readings/month?year=${y}&month=${m}`);
  }

  downloadExcel(from: string, to: string): Observable<Blob> {
    return this.http.get(`${this.base}/export/excel?from=${from}&to=${to}`,
      { responseType: 'blob' });
  }

  downloadPdf(from: string, to: string): Observable<Blob> {
    return this.http.get(`${this.base}/export/pdf?from=${from}&to=${to}`,
      { responseType: 'blob' });
  }

  // ---- Customers ----
  listCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.base}/customers`);
  }
  getCreditReport(): Observable<CreditReport> {
    return this.http.get<CreditReport>(`${this.base}/customers/credit-report`);
  }
  downloadCreditReportExcel(): Observable<Blob> {
    return this.http.get(`${this.base}/export/credit-report/excel`, { responseType: 'blob' });
  }
  downloadCreditReportPdf(): Observable<Blob> {
    return this.http.get(`${this.base}/export/credit-report/pdf`, { responseType: 'blob' });
  }
  getCustomer(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.base}/customers/${id}`);
  }
  createCustomer(body: { companyName: string; contactPerson?: string; phone?: string }): Observable<Customer> {
    return this.http.post<Customer>(`${this.base}/customers`, body);
  }
  updateCustomer(id: number, body: { companyName: string; contactPerson?: string; phone?: string }): Observable<Customer> {
    return this.http.put<Customer>(`${this.base}/customers/${id}`, body);
  }
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/customers/${id}`);
  }
  addVehicle(body: { customerId: number; vehicleNumber: string; fuelType: FuelType; description?: string }): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.base}/customers/vehicles`, body);
  }
  updateVehicle(id: number, body: { customerId: number; vehicleNumber: string; fuelType: FuelType; description?: string }): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.base}/customers/vehicles/${id}`, body);
  }
  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/customers/vehicles/${id}`);
  }
  getVehicleLedger(id: number): Observable<VehicleLedger> {
    return this.http.get<VehicleLedger>(`${this.base}/customers/vehicles/${id}/ledger`);
  }
  addCredit(body: { vehicleId: number; litres: number; entryDate?: string; note?: string }): Observable<VehicleLedger> {
    return this.http.post<VehicleLedger>(`${this.base}/customers/credit`, body);
  }
  addPayment(body: { vehicleId: number; amount: number; entryDate?: string; note?: string }): Observable<VehicleLedger> {
    return this.http.post<VehicleLedger>(`${this.base}/customers/payment`, body);
  }
  updateEntry(id: number, body: { entryDate?: string; litres?: number; amount?: number; note?: string }): Observable<VehicleLedger> {
    return this.http.put<VehicleLedger>(`${this.base}/customers/entries/${id}`, body);
  }
  deleteEntry(id: number): Observable<VehicleLedger> {
    return this.http.delete<VehicleLedger>(`${this.base}/customers/entries/${id}`);
  }
  downloadCustomerExcel(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/export/customer/${id}/excel`, { responseType: 'blob' });
  }
  downloadCustomerPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/export/customer/${id}/pdf`, { responseType: 'blob' });
  }
}
