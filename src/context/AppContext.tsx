import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppUser,
  Flat,
  Shop,
  Tenant,
  Bill,
  Payment,
  Expense,
  CashBookEntry,
  ActivityLog,
  AppSettings,
  UserRole,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  generateSeedPropertiesAndTenants,
  generateSeedBillsAndPayments,
} from '../data/seedData';
import { getCurrentMonthYear } from '../utils/formatters';

interface AppContextType {
  currentUser: AppUser;
  users: AppUser[];
  flats: Flat[];
  shops: Shop[];
  tenants: Tenant[];
  bills: Bill[];
  payments: Payment[];
  expenses: Expense[];
  cashBookEntries: CashBookEntry[];
  activityLogs: ActivityLog[];
  settings: AppSettings;
  selectedMonth: string;
  selectedYear: number;
  setSelectedMonth: (month: string) => void;
  setSelectedYear: (year: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedReceiptModal: Payment | null;
  setSelectedReceiptModal: (payment: Payment | null) => void;
  selectedStatementModal: { tenant: Tenant; month: string; year: number } | null;
  setSelectedStatementModal: (val: { tenant: Tenant; month: string; year: number } | null) => void;
  
  // Actions
  switchUser: (userId: string) => void;
  addUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, data: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  
  // Properties
  addFlat: (flat: Omit<Flat, 'id'>) => void;
  updateFlat: (id: string, flat: Partial<Flat>) => void;
  deleteFlat: (id: string) => void;
  addShop: (shop: Omit<Shop, 'id'>) => void;
  updateShop: (id: string, shop: Partial<Shop>) => void;
  deleteShop: (id: string) => void;
  
  // Tenants
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>) => void;
  updateTenant: (id: string, data: Partial<Tenant>) => void;
  archiveTenant: (id: string) => void;
  
  // Billing
  generateMonthlyBills: (month: string, year: number) => { generatedCount: number; skippedCount: number };
  createBill: (bill: Omit<Bill, 'id' | 'billNumber' | 'createdAt'>) => void;
  updateBill: (id: string, data: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  
  // Payments
  recordPayment: (payment: {
    tenantId: string;
    unitType: 'flat' | 'shop';
    unitId: string;
    unitNumber: string;
    month: string;
    year: number;
    billId?: string;
    paymentDate: string;
    amount: number;
    paymentMethod: any;
    reference?: string;
    bankName?: string;
    notes?: string;
  }) => Payment;
  deletePayment: (id: string) => void;
  
  // Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'voucherNumber' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  
  // CashBook
  addCashBookEntry: (entry: Omit<CashBookEntry, 'id' | 'createdAt'>) => void;
  
  // Settings & System
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  logActivity: (action: string, details: string, entityType: ActivityLog['entityType'], entityId?: string) => void;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'prms_users_v2',
  CURRENT_USER_ID: 'prms_current_user_id_v2',
  FLATS: 'prms_flats_v2',
  SHOPS: 'prms_shops_v2',
  TENANTS: 'prms_tenants_v2',
  BILLS: 'prms_bills_v2',
  PAYMENTS: 'prms_payments_v2',
  EXPENSES: 'prms_expenses_v2',
  CASHBOOK: 'prms_cashbook_v2',
  ACTIVITY: 'prms_activity_v2',
  SETTINGS: 'prms_settings_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentDefaults = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentDefaults.month);
  const [selectedYear, setSelectedYear] = useState<number>(currentDefaults.year);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [selectedReceiptModal, setSelectedReceiptModal] = useState<Payment | null>(null);
  const [selectedStatementModal, setSelectedStatementModal] = useState<{
    tenant: Tenant;
    month: string;
    year: number;
  } | null>(null);

  // Initialize state with lazy load or seed data
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || INITIAL_USERS[0].id;
  });

  const [flats, setFlats] = useState<Flat[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FLATS);
    if (saved) return JSON.parse(saved);
    const { flats } = generateSeedPropertiesAndTenants();
    return flats;
  });

  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOPS);
    if (saved) return JSON.parse(saved);
    const { shops } = generateSeedPropertiesAndTenants();
    return shops;
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TENANTS);
    if (saved) return JSON.parse(saved);
    const { tenants } = generateSeedPropertiesAndTenants();
    return tenants;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
    if (saved) return JSON.parse(saved);
    const { flats, shops, tenants } = generateSeedPropertiesAndTenants();
    const { bills } = generateSeedBillsAndPayments(flats, shops, tenants);
    return bills;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (saved) return JSON.parse(saved);
    const { flats, shops, tenants } = generateSeedPropertiesAndTenants();
    const { payments } = generateSeedBillsAndPayments(flats, shops, tenants);
    return payments;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (saved) return JSON.parse(saved);
    const { flats, shops, tenants } = generateSeedPropertiesAndTenants();
    const { expenses } = generateSeedBillsAndPayments(flats, shops, tenants);
    return expenses;
  });

  const [cashBookEntries, setCashBookEntries] = useState<CashBookEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASHBOOK);
    if (saved) return JSON.parse(saved);
    const { flats, shops, tenants } = generateSeedPropertiesAndTenants();
    const { cashBookEntries } = generateSeedBillsAndPayments(flats, shops, tenants);
    return cashBookEntries;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    if (saved) return JSON.parse(saved);
    const { flats, shops, tenants } = generateSeedPropertiesAndTenants();
    const { activityLogs } = generateSeedBillsAndPayments(flats, shops, tenants);
    return activityLogs;
  });

  // Current active user object
  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FLATS, JSON.stringify(flats));
  }, [flats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
  }, [shops]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASHBOOK, JSON.stringify(cashBookEntries));
  }, [cashBookEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Log activity helper
  const logActivity = (
    action: string,
    details: string,
    entityType: ActivityLog['entityType'],
    entityId?: string
  ) => {
    const now = new Date();
    const timeFormatted = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: timeFormatted,
      userRole: currentUser.role,
      userName: currentUser.name,
      action,
      details,
      entityType,
      entityId,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // User Actions
  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const target = users.find((u) => u.id === userId);
    if (target) {
      logActivity('User Switched', `Logged in as ${target.name} (${target.role.toUpperCase()})`, 'user', target.id);
    }
  };

  const addUser = (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    const newUser: AppUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
    logActivity('User Created', `Created new ${newUser.role} user: ${newUser.name}`, 'user', newUser.id);
  };

  const updateUser = (id: string, data: Partial<AppUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    logActivity('User Updated', `Updated user account details (ID: ${id})`, 'user', id);
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logActivity('User Deleted', `Deleted user account: ${target?.name || id}`, 'user', id);
  };

  // Property Actions
  const addFlat = (flatData: Omit<Flat, 'id'>) => {
    const newFlat: Flat = {
      ...flatData,
      id: `flat-${Date.now()}`,
    };
    setFlats((prev) => [...prev, newFlat]);
    logActivity('Flat Added', `${currentUser.name} created Flat ${newFlat.flatNumber}`, 'flat', newFlat.id);
  };

  const updateFlat = (id: string, flatData: Partial<Flat>) => {
    setFlats((prev) => prev.map((f) => (f.id === id ? { ...f, ...flatData } : f)));
    logActivity('Flat Updated', `Updated Flat ${flatData.flatNumber || id} details`, 'flat', id);
  };

  const deleteFlat = (id: string) => {
    const target = flats.find((f) => f.id === id);
    setFlats((prev) => prev.filter((f) => f.id !== id));
    logActivity('Flat Deleted', `Deleted Flat ${target?.flatNumber || id}`, 'flat', id);
  };

  const addShop = (shopData: Omit<Shop, 'id'>) => {
    const newShop: Shop = {
      ...shopData,
      id: `shop-${Date.now()}`,
    };
    setShops((prev) => [...prev, newShop]);
    logActivity('Shop Added', `${currentUser.name} created Shop ${newShop.shopNumber} (${newShop.businessName || 'General'})`, 'shop', newShop.id);
  };

  const updateShop = (id: string, shopData: Partial<Shop>) => {
    setShops((prev) => prev.map((s) => (s.id === id ? { ...s, ...shopData } : s)));
    logActivity('Shop Updated', `Updated Shop ${shopData.shopNumber || id} details`, 'shop', id);
  };

  const deleteShop = (id: string) => {
    const target = shops.find((s) => s.id === id);
    setShops((prev) => prev.filter((s) => s.id !== id));
    logActivity('Shop Deleted', `Deleted Shop ${target?.shopNumber || id}`, 'shop', id);
  };

  // Tenant Actions
  const addTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    const newTenant: Tenant = {
      ...tenantData,
      id: `tnt-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTenants((prev) => [...prev, newTenant]);

    // Update the unit's status and tenantId
    if (newTenant.unitType === 'flat') {
      setFlats((prev) =>
        prev.map((f) =>
          f.id === newTenant.unitId
            ? { ...f, tenantId: newTenant.id, status: 'occupied', rent: newTenant.monthlyRent }
            : f
        )
      );
    } else {
      setShops((prev) =>
        prev.map((s) =>
          s.id === newTenant.unitId
            ? { ...s, tenantId: newTenant.id, status: 'occupied', rent: newTenant.monthlyRent }
            : s
        )
      );
    }

    logActivity('Tenant Added', `Added tenant ${newTenant.name} for ${newTenant.unitType.toUpperCase()} ${newTenant.unitNumber}`, 'tenant', newTenant.id);
  };

  const updateTenant = (id: string, data: Partial<Tenant>) => {
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    logActivity('Tenant Updated', `Updated profile of tenant ID ${id}`, 'tenant', id);
  };

  const archiveTenant = (id: string) => {
    const target = tenants.find((t) => t.id === id);
    if (!target) return;

    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'archived' } : t)));

    // Set unit as vacant
    if (target.unitType === 'flat') {
      setFlats((prev) =>
        prev.map((f) => (f.id === target.unitId ? { ...f, tenantId: undefined, status: 'vacant' } : f))
      );
    } else {
      setShops((prev) =>
        prev.map((s) => (s.id === target.unitId ? { ...s, tenantId: undefined, status: 'vacant' } : s))
      );
    }

    logActivity('Tenant Released / Archived', `Released tenant ${target.name} from unit ${target.unitNumber}`, 'tenant', id);
  };

  // Billing Actions
  const generateMonthlyBills = (month: string, year: number) => {
    let generatedCount = 0;
    let skippedCount = 0;
    const newBills: Bill[] = [];

    const activeTenants = tenants.filter((t) => t.status === 'active');

    activeTenants.forEach((tenant) => {
      // Check if bill already exists for this unit + month + year
      const existing = bills.find(
        (b) => b.unitId === tenant.unitId && b.month === month && b.year === year
      );

      if (existing) {
        skippedCount++;
        return;
      }

      const isFlat = tenant.unitType === 'flat';
      const unit = isFlat
        ? flats.find((f) => f.id === tenant.unitId)
        : shops.find((s) => s.id === tenant.unitId);

      const rent = tenant.monthlyRent || unit?.rent || 20000;
      const charges = unit?.monthlyCharges || {
        electricity: 2500,
        water: 600,
        gas: 1000,
        serviceCharge: 1500,
        other: 300,
      };

      const total =
        rent +
        (charges.electricity || 0) +
        (charges.water || 0) +
        (charges.gas || 0) +
        (charges.serviceCharge || 0) +
        (charges.other || 0);

      const billId = `bil-${year}-${month.toLowerCase().slice(0, 3)}-${Date.now()}-${generatedCount}`;
      const billNumber = `BIL-${year}-${month.slice(0, 3).toUpperCase()}-${String(bills.length + generatedCount + 1).padStart(4, '0')}`;

      const newBill: Bill = {
        id: billId,
        billNumber,
        month,
        year,
        date: `${year}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
        dueDate: `${year}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(settings.defaultRentDueDate).padStart(2, '0')}`,
        unitType: tenant.unitType,
        unitId: tenant.unitId,
        unitNumber: tenant.unitNumber,
        tenantId: tenant.id,
        tenantName: tenant.name,
        items: {
          rent,
          electricity: charges.electricity || 0,
          water: charges.water || 0,
          gas: charges.gas || 0,
          serviceCharge: charges.serviceCharge || 0,
          other: charges.other || 0,
        },
        totalAmount: total,
        paidAmount: 0,
        dueAmount: total,
        status: 'unpaid',
        generatedBy: `${currentUser.name} (${currentUser.role})`,
        createdAt: new Date().toISOString(),
      };

      newBills.push(newBill);
      generatedCount++;
    });

    if (newBills.length > 0) {
      setBills((prev) => [...newBills, ...prev]);
      logActivity(
        'Generate Monthly Bills',
        `${currentUser.name} generated ${generatedCount} bills for ${month} ${year}`,
        'bill'
      );
    }

    return { generatedCount, skippedCount };
  };

  const createBill = (billData: Omit<Bill, 'id' | 'billNumber' | 'createdAt'>) => {
    const newBill: Bill = {
      ...billData,
      id: `bil-${Date.now()}`,
      billNumber: `BIL-${billData.year}-${billData.month.slice(0, 3).toUpperCase()}-${String(bills.length + 1).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
    };
    setBills((prev) => [newBill, ...prev]);
    logActivity('Bill Created', `Created manual bill ${newBill.billNumber} for ${newBill.tenantName} (${newBill.unitNumber})`, 'bill', newBill.id);
  };

  const updateBill = (id: string, data: Partial<Bill>) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
    logActivity('Bill Updated', `Updated bill ID ${id}`, 'bill', id);
  };

  const deleteBill = (id: string) => {
    const target = bills.find((b) => b.id === id);
    setBills((prev) => prev.filter((b) => b.id !== id));
    logActivity('Bill Deleted', `Deleted bill ${target?.billNumber || id}`, 'bill', id);
  };

  // Payment Recording
  const recordPayment = (pData: {
    tenantId: string;
    unitType: 'flat' | 'shop';
    unitId: string;
    unitNumber: string;
    month: string;
    year: number;
    billId?: string;
    paymentDate: string;
    amount: number;
    paymentMethod: any;
    reference?: string;
    bankName?: string;
    notes?: string;
  }): Payment => {
    const tenant = tenants.find((t) => t.id === pData.tenantId);
    const tenantName = tenant ? tenant.name : 'Unknown Tenant';

    const receiptSeq = payments.length + 1;
    const receiptNumber = `RCT-${pData.year}-${pData.month.slice(0, 3).toUpperCase()}-${String(receiptSeq).padStart(4, '0')}`;

    const newPayment: Payment = {
      id: `pmt-${Date.now()}`,
      receiptNumber,
      tenantId: pData.tenantId,
      tenantName,
      unitType: pData.unitType,
      unitId: pData.unitId,
      unitNumber: pData.unitNumber,
      month: pData.month,
      year: pData.year,
      billId: pData.billId,
      paymentDate: pData.paymentDate,
      amount: Number(pData.amount),
      paymentMethod: pData.paymentMethod,
      reference: pData.reference,
      bankName: pData.bankName,
      receivedBy: currentUser.name,
      notes: pData.notes,
      createdAt: new Date().toISOString(),
    };

    // Update corresponding bill if billId is provided
    if (pData.billId) {
      setBills((prev) =>
        prev.map((b) => {
          if (b.id === pData.billId) {
            const newPaid = Number(b.paidAmount || 0) + Number(pData.amount);
            const newDue = Math.max(0, b.totalAmount - newPaid);
            const newStatus: Bill['status'] = newDue <= 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
            return {
              ...b,
              paidAmount: newPaid,
              dueAmount: newDue,
              status: newStatus,
            };
          }
          return b;
        })
      );
    }

    setPayments((prev) => [newPayment, ...prev]);

    // Add CashBook entry
    const newCashEntry: CashBookEntry = {
      id: `cb-${Date.now()}`,
      date: pData.paymentDate,
      month: pData.month,
      year: pData.year,
      type: 'in',
      category: 'Rent Collection',
      description: `Payment from ${tenantName} for ${pData.unitNumber} (${pData.month} ${pData.year})`,
      amount: Number(pData.amount),
      sourceOrPayee: tenantName,
      referenceId: newPayment.id,
      recordedBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setCashBookEntries((prev) => [newCashEntry, ...prev]);

    logActivity(
      'Payment Received',
      `${currentUser.name} received ৳${pData.amount.toLocaleString()} from ${tenantName} (${pData.unitNumber}) for ${pData.month} ${pData.year} [${newPayment.receiptNumber}]`,
      'payment',
      newPayment.id
    );

    return newPayment;
  };

  const deletePayment = (id: string) => {
    const target = payments.find((p) => p.id === id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
    setCashBookEntries((prev) => prev.filter((cb) => cb.referenceId !== id));
    logActivity('Payment Voided/Deleted', `Deleted payment record ${target?.receiptNumber || id}`, 'payment', id);
  };

  // Expense Actions
  const addExpense = (expData: Omit<Expense, 'id' | 'voucherNumber' | 'createdAt'>) => {
    const voucherSeq = expenses.length + 1;
    const voucherNumber = `EXP-${expData.year}-${expData.month.slice(0, 3).toUpperCase()}-${String(voucherSeq).padStart(3, '0')}`;

    const newExpense: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      voucherNumber,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // Add to CashBook
    const newCashEntry: CashBookEntry = {
      id: `cb-exp-${Date.now()}`,
      date: expData.date,
      month: expData.month,
      year: expData.year,
      type: 'out',
      category: expData.category,
      description: expData.title + (expData.paidTo ? ` (Paid to ${expData.paidTo})` : ''),
      amount: Number(expData.amount),
      sourceOrPayee: expData.paidTo || expData.category,
      referenceId: newExpense.id,
      recordedBy: expData.paidBy || currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setCashBookEntries((prev) => [newCashEntry, ...prev]);

    logActivity(
      'Expense Added',
      `${currentUser.name} added expense: ${expData.title} (৳${expData.amount.toLocaleString()}) [${voucherNumber}]`,
      'expense',
      newExpense.id
    );
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setCashBookEntries((prev) => prev.filter((cb) => cb.referenceId !== id));
    logActivity('Expense Deleted', `Deleted expense voucher ${target?.voucherNumber || id}`, 'expense', id);
  };

  const addCashBookEntry = (entry: Omit<CashBookEntry, 'id' | 'createdAt'>) => {
    const newEntry: CashBookEntry = {
      ...entry,
      id: `cb-manual-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCashBookEntries((prev) => [newEntry, ...prev]);
    logActivity('Cash Book Entry', `Added manual cash book entry: ${entry.description} (৳${entry.amount})`, 'cashbook');
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logActivity('Settings Updated', `Owner updated system configuration and property information`, 'setting');
  };

  const resetToDefaultData = () => {
    const { flats: seedFlats, shops: seedShops, tenants: seedTenants } = generateSeedPropertiesAndTenants();
    const seedBilling = generateSeedBillsAndPayments(seedFlats, seedShops, seedTenants);

    setSettings(INITIAL_SETTINGS);
    setUsers(INITIAL_USERS);
    setCurrentUserId(INITIAL_USERS[0].id);
    setFlats(seedFlats);
    setShops(seedShops);
    setTenants(seedTenants);
    setBills(seedBilling.bills);
    setPayments(seedBilling.payments);
    setExpenses(seedBilling.expenses);
    setCashBookEntries(seedBilling.cashBookEntries);
    setActivityLogs(seedBilling.activityLogs);

    localStorage.clear();
    logActivity('System Reset', 'Reset all system data to initial standard demo state', 'setting');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        flats,
        shops,
        tenants,
        bills,
        payments,
        expenses,
        cashBookEntries,
        activityLogs,
        settings,
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        activeTab,
        setActiveTab,
        selectedReceiptModal,
        setSelectedReceiptModal,
        selectedStatementModal,
        setSelectedStatementModal,
        switchUser,
        addUser,
        updateUser,
        deleteUser,
        addFlat,
        updateFlat,
        deleteFlat,
        addShop,
        updateShop,
        deleteShop,
        addTenant,
        updateTenant,
        archiveTenant,
        generateMonthlyBills,
        createBill,
        updateBill,
        deleteBill,
        recordPayment,
        deletePayment,
        addExpense,
        deleteExpense,
        addCashBookEntry,
        updateSettings,
        logActivity,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
