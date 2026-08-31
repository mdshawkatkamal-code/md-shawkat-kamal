export type UserRole = 'owner' | 'manager';

export interface AppUser {
  id: string;
  name: string;
  nameBn?: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type UnitType = 'flat' | 'shop';
export type UnitStatus = 'occupied' | 'vacant' | 'reserved';

export interface UtilityCharges {
  houseRent?: number;
  shopRent?: number;
  electricity: number;
  water: number;
  gas: number;
  serviceCharge: number;
  other: number;
}

export interface Flat {
  id: string;
  flatNumber: string; // e.g. F-101, F-202
  floor: number;
  size: number; // in sq ft
  rent: number;
  tenantId?: string;
  startDate?: string;
  status: UnitStatus;
  monthlyCharges: UtilityCharges;
  notes?: string;
}

export interface Shop {
  id: string;
  shopNumber: string; // e.g. S-01, S-02
  floor: number;
  size: number; // in sq ft
  rent: number;
  businessName?: string;
  tenantId?: string;
  startDate?: string;
  status: UnitStatus;
  monthlyCharges: UtilityCharges;
  notes?: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  nid: string;
  unitType: UnitType;
  unitId: string;
  unitNumber: string;
  monthlyRent: number;
  agreementStart: string;
  agreementEnd: string;
  securityDeposit: number;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  status: 'active' | 'archived';
  avatar?: string;
  createdAt: string;
}

export type BillStatus = 'paid' | 'partial' | 'unpaid' | 'overdue';

export interface BillItemBreakdown {
  rent: number;
  electricity: number;
  water: number;
  gas: number;
  serviceCharge: number;
  other: number;
  lateFee?: number;
  previousDue?: number;
}

export interface Bill {
  id: string;
  billNumber: string; // e.g. BIL-2026-08-0101
  month: string; // "January", "February", etc.
  year: number; // 2026
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  unitType: UnitType;
  unitId: string;
  unitNumber: string;
  tenantId: string;
  tenantName: string;
  items: BillItemBreakdown;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: BillStatus;
  generatedBy: string; // User Name
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'bank' | 'mobile_banking' | 'other';

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. RCT-2026-08-0101
  tenantId: string;
  tenantName: string;
  unitType: UnitType;
  unitId: string;
  unitNumber: string;
  month: string;
  year: number;
  billId?: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string; // e.g. Cheque no, bKash TrxID
  bankName?: string;
  receivedBy: string;
  notes?: string;
  createdAt: string;
}

export type User = AppUser;
export type Settings = AppSettings;

export type ExpenseCategory =
  | 'Electricity Common Area'
  | 'Cleaner Salary'
  | 'Security Salary'
  | 'Maintenance'
  | 'Generator/Lift'
  | 'Water & Sanitation'
  | 'Office Expense'
  | 'Tax & Govt Fees'
  | 'electricity'
  | 'generator'
  | 'water_repair'
  | 'security_salary'
  | 'cleaner_salary'
  | 'lift_maintenance'
  | 'management'
  | 'other'
  | 'Other';

export interface Expense {
  id: string;
  voucherNumber: string; // e.g. EXP-2026-08-01
  date: string;
  month: string;
  year: number;
  category: ExpenseCategory;
  title: string;
  description?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidTo?: string;
  paidBy: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface CashBookEntry {
  id: string;
  date: string;
  month: string;
  year: number;
  type: 'in' | 'out';
  category: string;
  description: string;
  amount: number;
  sourceOrPayee: string;
  referenceId?: string; // Bill ID, Payment ID or Expense ID
  recordedBy: string;
  balanceAfter?: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  action: string;
  details: string;
  entityType: 'flat' | 'shop' | 'tenant' | 'bill' | 'payment' | 'expense' | 'setting' | 'user' | 'cashbook';
  entityId?: string;
}

export interface AppSettings {
  propertyName: string;
  propertyNameBn: string;
  address: string;
  addressBn: string;
  phone: string;
  email: string;
  logoUrl?: string;
  currency: string;
  currencySymbol: string;
  defaultRentDueDate: number; // e.g., 10th of month
  lateFee: number;
  billGenerationDay: number; // e.g., 1st of month
  receiptNumberFormat: string; // e.g., RCT-YYYY-MM-XXXX
  financialYear: string; // e.g., 2026-2027
  openingCashBalance: number;
}
