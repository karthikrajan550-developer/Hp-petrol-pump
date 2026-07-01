export type FuelType = 'PETROL' | 'DIESEL' | 'POWER_PETROL';

export interface FuelPrice {
  fuelType: FuelType;
  pricePerLitre: number;
  effectiveFrom: string;
  lastUpdated: string;
}

export interface UpdatePriceRequest {
  fuelType: FuelType;
  pricePerLitre: number;
  effectiveFrom?: string;
}

export interface PumpReading {
  pumpId: number;
  pumpName: string;
  fuelType: FuelType;
  displayOrder: number;
  openingReading: number;
  closingReading: number | null;
  litresSold: number | null;
  pricePerLitre: number;
  amount: number | null;
}

export interface FuelTypeTotal {
  fuelType: FuelType;
  totalLitres: number;
  totalAmount: number;
}

export interface DailySummary {
  date: string;
  pumps: PumpReading[];
  fuelTypeTotals: FuelTypeTotal[];
  grandTotalLitres: number;
  grandTotalAmount: number;
}

export interface SaveReadingsRequest {
  date: string;
  readings: { pumpId: number; closingReading: number | null }[];
}

export interface DateTotal {
  date: string;
  grandTotalLitres: number;
  grandTotalAmount: number;
}

export interface MonthlySummary {
  year: number;
  month: number;
  monthLabel: string;
  fuelTypeTotals: FuelTypeTotal[];
  grandTotalLitres: number;
  grandTotalAmount: number;
  days: DateTotal[];
}

export interface Vehicle {
  id: number;
  customerId: number;
  vehicleNumber: string;
  fuelType: FuelType;
  description?: string;
  totalCredit: number;
  totalPaid: number;
  balance: number;
  currentPrice: number;
}

export interface Customer {
  id: number;
  companyName: string;
  contactPerson?: string;
  phone?: string;
  totalOutstanding: number;
  vehicles?: Vehicle[];
}

export interface LedgerEntry {
  id: number;
  vehicleId: number;
  entryType: 'CREDIT' | 'PAYMENT';
  entryDate: string;
  litres?: number;
  pricePerLitre?: number;
  amount: number;
  note?: string;
  runningBalance: number;
}

export interface VehicleLedger {
  vehicle: Vehicle;
  entries: LedgerEntry[];
  totalCredit: number;
  totalPaid: number;
  balance: number;
}

export interface CreditReportRow {
  customerId: number;
  companyName: string;
  contactPerson?: string;
  phone?: string;
  vehicleCount: number;
  totalCredit: number;
  totalPaid: number;
  outstanding: number;
}

export interface CreditReport {
  customers: CreditReportRow[];
  grandTotalCredit: number;
  grandTotalPaid: number;
  grandTotalOutstanding: number;
}
