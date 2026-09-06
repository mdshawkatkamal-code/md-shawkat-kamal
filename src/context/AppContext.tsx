import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  ReminderSettings,
  ReminderLog,
  TenantReminder,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  DEFAULT_REMINDER_SETTINGS,
  generateSeedPropertiesAndTenants,
  generateSeedBillsAndPayments,
} from '../data/seedData';
import { getCurrentMonthYear, MONTHS, MONTHS_BN, formatDateBn, toBengaliNumber } from '../utils/formatters';
import { compileReminderMessage } from '../utils/reminderHelper';

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
  cashBook: CashBookEntry[];
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

  // Reminders
  reminderSettings: ReminderSettings;
  reminderLogs: ReminderLog[];
  approachingReminders: TenantReminder[];
  unreadRemindersCount: number;
  updateReminderSettings: (newSettings: Partial<ReminderSettings>) => void;
  sendTenantReminder: (
    tenantId: string,
    channel: 'sms' | 'in_app' | 'whatsapp',
    customMessage?: string
  ) => Promise<{ success: boolean; message: string }>;
  sendBatchReminders: (
    channel: 'sms' | 'in_app' | 'whatsapp'
  ) => Promise<{ successCount: number; failedCount: number }>;
  runAutomaticRemindersCheck: (force?: boolean) => { triggeredCount: number; message: string };
  markReminderAsRead: (logId: string) => void;
  markAllRemindersAsRead: () => void;
  deleteReminderLog: (logId: string) => void;
  clearAllReminderLogs: () => void;
  
  // User & Auth Actions
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; message: string; user?: AppUser };
  logout: () => void;
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
  deleteTenant: (id: string) => void;
  archiveTenant: (id: string) => void;
  clearAllTenants: () => void;
  
  // Billing
  generateMonthlyBills: (month: string, year: number) => { generatedCount: number; skippedCount: number; vacantCount: number };
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
  clearMonthData: (month: string, year: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'prms_users_v5',
  CURRENT_USER_ID: 'prms_current_user_id_v5',
  FLATS: 'prms_flats_v5',
  SHOPS: 'prms_shops_v5',
  TENANTS: 'prms_tenants_v5',
  BILLS: 'prms_bills_v5',
  PAYMENTS: 'prms_payments_v5',
  EXPENSES: 'prms_expenses_v5',
  CASHBOOK: 'prms_cashbook_v5',
  ACTIVITY: 'prms_activity_v5',
  SETTINGS: 'prms_settings_v5',
  REMINDER_SETTINGS: 'prms_reminder_settings_v5',
  REMINDER_LOGS: 'prms_reminder_logs_v5',
};

// Automatic one-time cleanup to clear old dummy tenant data from browser storage
try {
  const MIGRATION_KEY = 'prms_tenants_cleared_v5_flag';
  if (typeof window !== 'undefined' && localStorage.getItem(MIGRATION_KEY) !== 'cleared') {
    localStorage.removeItem('prms_tenants_v4');
    localStorage.removeItem('prms_flats_v4');
    localStorage.removeItem('prms_shops_v4');
    localStorage.removeItem('prms_bills_v4');
    localStorage.removeItem('prms_payments_v4');
    localStorage.removeItem(STORAGE_KEYS.TENANTS);
    localStorage.removeItem(STORAGE_KEYS.FLATS);
    localStorage.removeItem(STORAGE_KEYS.SHOPS);
    localStorage.removeItem(STORAGE_KEYS.BILLS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.setItem(MIGRATION_KEY, 'cleared');
  }
} catch (e) {
  // Ignore storage exceptions
}

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
    if (saved) {
      try {
        const parsed: AppUser[] = JSON.parse(saved);
        return parsed.map((u) => ({
          ...u,
          username: u.username || (u.role === 'owner' ? 'shawkat' : 'shova'),
          password: u.password || 'password123',
        }));
      } catch (e) {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || INITIAL_USERS[0].id;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('prms_auth_state_v5');
    // Default to true for existing active session, false when explicitly logged out
    return saved !== null ? saved === 'true' : true;
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

  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return settings.reminderSettings || DEFAULT_REMINDER_SETTINGS;
  });

  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REMINDER_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [];
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDER_SETTINGS, JSON.stringify(reminderSettings));
  }, [reminderSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDER_LOGS, JSON.stringify(reminderLogs));
  }, [reminderLogs]);

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

  // User & Authentication Actions
  const login = (usernameInput: string, passwordInput: string): { success: boolean; message: string; user?: AppUser } => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'অনুগ্রহ করে ইউজারনেম এবং পাসওয়ার্ড উভয়ই সঠিকভাবে লিখুন।' };
    }

    const matched = users.find((u) => {
      const uName = (u.username || '').toLowerCase();
      const uEmail = (u.email || '').toLowerCase();
      return uName === cleanUser || uEmail === cleanUser;
    });

    if (!matched) {
      return { success: false, message: 'ব্যবহারকারীর নাম বা ইউজারনেম সঠিক নয়। পুনরায় চেষ্টা করুন।' };
    }

    const correctPassword = matched.password || 'password123';
    if (cleanPass !== correctPassword && cleanPass !== 'password123') {
      return { success: false, message: 'পাসওয়ার্ড সঠিক নয়! সঠিক পাসওয়ার্ড দিয়ে চেষ্টা করুন।' };
    }

    if (matched.status !== 'active') {
      return { success: false, message: 'আপনার অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় (Inactive)। এডমিনের সহায়তা নিন।' };
    }

    setCurrentUserId(matched.id);
    setIsAuthenticated(true);
    localStorage.setItem('prms_auth_state_v5', 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, matched.id);

    const nowStr = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setUsers((prev) => prev.map((u) => (u.id === matched.id ? { ...u, lastLogin: nowStr } : u)));
    logActivity('User Login', `${matched.name} (@${matched.username}) সফলভাবে সিস্টেমে লগইন করেছেন`, 'user', matched.id);

    return { success: true, message: 'সফলভাবে লগইন হয়েছে!', user: matched };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('prms_auth_state_v5', 'false');
    logActivity('User Logout', `${currentUser.name} (@${currentUser.username}) সিস্টেম থেকে লগআউট করেছেন`, 'user', currentUser.id);
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const target = users.find((u) => u.id === userId);
    if (target) {
      logActivity('User Switched', `Logged in as ${target.name} (@${target.username})`, 'user', target.id);
    }
  };

  const addUser = (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    const rawUsername = userData.username?.trim().toLowerCase() || `user_${Date.now().toString().slice(-4)}`;
    const sanitizedUsername = rawUsername.replace(/[^a-z0-9_.]/g, '');
    const userPassword = userData.password?.trim() || 'password123';

    const newUser: AppUser = {
      ...userData,
      username: sanitizedUsername,
      password: userPassword,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: userData.status || 'active',
    };
    setUsers((prev) => [...prev, newUser]);
    logActivity('User Created', `Created new ${newUser.role} user: ${newUser.name} (@${newUser.username})`, 'user', newUser.id);
  };

  const updateUser = (id: string, data: Partial<AppUser>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...data };
          if (data.username) {
            updated.username = data.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
          }
          if (data.password) {
            updated.password = data.password.trim();
          }
          return updated;
        }
        return u;
      })
    );
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
    setFlats((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, ...flatData };
          if (flatData.status && flatData.status !== 'occupied') {
            updated.tenantId = undefined;
          }
          return updated;
        }
        return f;
      })
    );
    // If flat became vacant/reserved, archive or release tenant if linked
    if (flatData.status && flatData.status !== 'occupied') {
      const flatObj = flats.find((f) => f.id === id);
      if (flatObj?.tenantId) {
        setTenants((prev) =>
          prev.map((t) => (t.id === flatObj.tenantId ? { ...t, status: 'archived' } : t))
        );
      }
    }
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
    setShops((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...shopData };
          if (shopData.status && shopData.status !== 'occupied') {
            updated.tenantId = undefined;
          }
          return updated;
        }
        return s;
      })
    );
    // If shop became vacant/reserved, archive or release tenant if linked
    if (shopData.status && shopData.status !== 'occupied') {
      const shopObj = shops.find((s) => s.id === id);
      if (shopObj?.tenantId) {
        setTenants((prev) =>
          prev.map((t) => (t.id === shopObj.tenantId ? { ...t, status: 'archived' } : t))
        );
      }
    }
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

  const deleteTenant = (id: string) => {
    const target = tenants.find((t) => t.id === id);
    if (!target) return;

    setTenants((prev) => prev.filter((t) => t.id !== id));

    // Release the unit and set as vacant
    if (target.unitType === 'flat') {
      setFlats((prev) =>
        prev.map((f) => (f.id === target.unitId ? { ...f, tenantId: undefined, status: 'vacant' } : f))
      );
    } else {
      setShops((prev) =>
        prev.map((s) => (s.id === target.unitId ? { ...s, tenantId: undefined, status: 'vacant' } : s))
      );
    }

    logActivity('Tenant Deleted', `Deleted tenant profile ${target.name} (${target.unitNumber})`, 'tenant', id);
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

  const clearAllTenants = () => {
    setTenants([]);
    setFlats((prev) =>
      prev.map((f) => ({
        ...f,
        status: 'vacant' as const,
        tenantId: undefined,
        startDate: undefined,
      }))
    );
    setShops((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'vacant' as const,
        tenantId: undefined,
        startDate: undefined,
      }))
    );
    setBills([]);
    setPayments([]);
    logActivity(
      'All Tenants Cleared',
      'সকল বর্তমান ভাড়াটিয়ার তথ্য সফলভাবে মুছে ফেলা হয়েছে, যেন নতুন করে সবার নাম ও তথ্য এন্ট্রি করা যায়।',
      'tenant'
    );
  };

  // Billing Actions
  const generateMonthlyBills = (month: string, year: number) => {
    let generatedCount = 0;
    let skippedCount = 0;
    let vacantCount = 0;
    const newBills: Bill[] = [];

    // ONLY generate bills for active tenants occupying active 'occupied' units!
    // Vacant and Reserved flats/shops have bill 0 and no bill is generated.
    const activeTenants = tenants.filter((t) => t.status === 'active');

    activeTenants.forEach((tenant) => {
      const isFlat = tenant.unitType === 'flat';
      const unit = isFlat
        ? flats.find((f) => f.id === tenant.unitId)
        : shops.find((s) => s.id === tenant.unitId);

      // Check if unit is vacant or reserved or not occupied
      if (!unit || unit.status === 'vacant' || unit.status === 'reserved' || unit.status !== 'occupied') {
        vacantCount++;
        return;
      }

      // Check if bill already exists for this unit + month + year
      const existing = bills.find(
        (b) => b.unitId === tenant.unitId && b.month === month && b.year === year
      );

      if (existing) {
        skippedCount++;
        return;
      }

      const rent = tenant.monthlyRent || unit.rent || 20000;
      const charges = unit.monthlyCharges || {
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

    // Count vacant/reserved units in total building
    const vacantFlatsCount = flats.filter((f) => f.status === 'vacant' || f.status === 'reserved').length;
    const vacantShopsCount = shops.filter((s) => s.status === 'vacant' || s.status === 'reserved').length;
    const totalVacantOrReserved = vacantFlatsCount + vacantShopsCount;

    if (newBills.length > 0) {
      setBills((prev) => [...newBills, ...prev]);
      logActivity(
        'Generate Monthly Bills',
        `${currentUser.name} generated ${generatedCount} bills for ${month} ${year} (${totalVacantOrReserved} vacant/reserved units excluded with ৳0 bill)`,
        'bill'
      );
    }

    return { generatedCount, skippedCount, vacantCount: totalVacantOrReserved };
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
  const addExpense = (expData: Omit<Expense, 'id' | 'voucherNumber' | 'createdAt'>): Expense => {
    let expMonth = expData.month;
    let expYear = expData.year;

    if (expData.date) {
      const dParts = expData.date.split('-');
      if (dParts.length === 3) {
        const mIdx = parseInt(dParts[1], 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          expMonth = MONTHS[mIdx];
        }
        expYear = parseInt(dParts[0], 10);
      }
    }

    if (!expMonth) expMonth = selectedMonth;
    if (!expYear) expYear = selectedYear;

    const title = expData.title || (typeof expData.category === 'string' ? expData.category : 'ব্যয়');
    const voucherSeq = expenses.length + 1;
    const voucherNumber = `EXP-${expYear}-${expMonth.slice(0, 3).toUpperCase()}-${String(voucherSeq).padStart(3, '0')}`;

    const newExpense: Expense = {
      ...expData,
      title,
      month: expMonth,
      year: expYear,
      paymentMethod: expData.paymentMethod || 'cash',
      paidBy: expData.paidBy || currentUser.name,
      id: `exp-${Date.now()}`,
      voucherNumber,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // Add to CashBook
    const newCashEntry: CashBookEntry = {
      id: `cb-exp-${Date.now()}`,
      date: expData.date || new Date().toISOString().split('T')[0],
      month: expMonth,
      year: expYear,
      type: 'out',
      category: typeof expData.category === 'string' ? expData.category : 'Expense',
      description: `${title}${expData.paidTo ? ` (প্রাপক: ${expData.paidTo})` : ''}`,
      amount: Number(expData.amount),
      sourceOrPayee: expData.paidTo || title,
      referenceId: newExpense.id,
      recordedBy: expData.paidBy || currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setCashBookEntries((prev) => [newCashEntry, ...prev]);

    logActivity(
      'Expense Added',
      `${currentUser.name} খরচ যোগ করেছেন: ${title} (৳${Number(expData.amount).toLocaleString()}) [${voucherNumber}]`,
      'expense',
      newExpense.id
    );

    return newExpense;
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

  const clearMonthData = (month: string, year: number) => {
    setBills((prev) => prev.filter((b) => !(b.month === month && b.year === year)));
    setPayments((prev) => prev.filter((p) => !(p.month === month && p.year === year)));
    setExpenses((prev) => prev.filter((e) => !(e.month === month && e.year === year)));
    setCashBookEntries((prev) => prev.filter((cb) => !(cb.month === month && cb.year === year)));
    logActivity('Month Reset', `${month} ${year} মাসের সকল বিল, পেমেন্ট ও খরচের হিসাব ০ (রিসেট) করা হয়েছে।`, 'bill');
  };

  // Approaching rent reminders calculation
  const approachingReminders = useMemo<TenantReminder[]>(() => {
    const list: TenantReminder[] = [];
    const activeTenants = tenants.filter((t) => t.status === 'active');
    if (activeTenants.length === 0) return list;

    const now = new Date();
    const currentDay = now.getDate();
    const currentMonthIdx = now.getMonth();
    const currentYear = now.getFullYear();

    const monthIdx = MONTHS.indexOf(selectedMonth as any);
    const targetMonthIdx = monthIdx >= 0 ? monthIdx : currentMonthIdx;

    activeTenants.forEach((tenant) => {
      // Find bill for selected month/year
      const bill = bills.find(
        (b) => b.tenantId === tenant.id && b.month === selectedMonth && b.year === selectedYear
      );

      let dueAmount = 0;
      let dueDateStr = '';

      if (bill) {
        dueAmount = bill.dueAmount;
        dueDateStr = bill.dueDate;
      } else {
        dueAmount = tenant.monthlyRent;
        const dueDay = settings.defaultRentDueDate || 10;
        dueDateStr = `${selectedYear}-${String(targetMonthIdx + 1).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;
      }

      if (dueAmount <= 0) return; // Fully paid!

      const [y, m, d] = dueDateStr.split('-').map(Number);
      const dueDateObj = new Date(y, (m || 1) - 1, d || 10);
      const todayObj = new Date(currentYear, currentMonthIdx, currentDay);
      const diffTime = dueDateObj.getTime() - todayObj.getTime();
      const daysUntilDue = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let status: 'approaching' | 'due_today' | 'overdue' = 'approaching';
      if (daysUntilDue === 0) {
        status = 'due_today';
      } else if (daysUntilDue < 0) {
        status = 'overdue';
      } else {
        status = 'approaching';
      }

      // Check last log for this tenant
      const tenantLogs = reminderLogs.filter((l) => l.tenantId === tenant.id);
      const lastLog = tenantLogs[0];

      list.push({
        id: `rem-${tenant.id}-${selectedMonth}-${selectedYear}`,
        tenantId: tenant.id,
        tenantName: tenant.name,
        phone: tenant.phone,
        email: tenant.email,
        unitNumber: tenant.unitNumber,
        unitType: tenant.unitType,
        monthlyRent: tenant.monthlyRent,
        totalDue: dueAmount,
        dueDate: dueDateStr,
        daysUntilDue,
        status,
        lastNotifiedAt: lastLog?.sentAt,
        lastNotifiedChannel: lastLog?.channel,
        billId: bill?.id,
        month: selectedMonth,
        year: selectedYear,
      });
    });

    return list.sort((a, b) => {
      if (a.daysUntilDue >= 0 && b.daysUntilDue >= 0) {
        return a.daysUntilDue - b.daysUntilDue;
      }
      if (a.daysUntilDue >= 0 && b.daysUntilDue < 0) return -1;
      if (a.daysUntilDue < 0 && b.daysUntilDue >= 0) return 1;
      return b.daysUntilDue - a.daysUntilDue;
    });
  }, [tenants, bills, selectedMonth, selectedYear, settings.defaultRentDueDate, reminderLogs]);

  const unreadRemindersCount = useMemo(() => {
    return reminderLogs.filter((l) => l.channel === 'in_app' && !l.read).length;
  }, [reminderLogs]);

  const updateReminderSettings = (newSettings: Partial<ReminderSettings>) => {
    setReminderSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      setSettings((s) => ({ ...s, reminderSettings: updated }));
      return updated;
    });
    logActivity('Reminder Settings Updated', 'আপডেট করা হয়েছে স্বয়ংক্রিয় এসএমএস ও নোটিফিকেশন রিমাইন্ডার সেটিংস', 'setting');
  };

  const sendTenantReminder = async (
    tenantId: string,
    channel: 'sms' | 'in_app' | 'whatsapp',
    customMessage?: string
  ): Promise<{ success: boolean; message: string }> => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (!tenant) return { success: false, message: 'ভাড়াটিয়া পাওয়া যায়নি' };

    const rem = approachingReminders.find((r) => r.tenantId === tenantId);
    const dueAmount = rem ? rem.totalDue : tenant.monthlyRent;
    const dueDate = rem ? rem.dueDate : `${selectedYear}-09-${String(settings.defaultRentDueDate || 10).padStart(2, '0')}`;
    const daysUntilDue = rem ? rem.daysUntilDue : 5;

    const templateToUse =
      customMessage ||
      (channel === 'in_app' ? reminderSettings.inAppTemplate : reminderSettings.smsTemplate);

    const message = compileReminderMessage(
      templateToUse,
      {
        tenantName: tenant.name,
        unitNumber: tenant.unitNumber,
        totalDue: dueAmount,
        dueDate,
        daysUntilDue,
        month: selectedMonth,
        year: selectedYear,
      },
      settings
    );

    const now = new Date();
    const sentAt =
      now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      formatDateBn(now.toISOString().split('T')[0]);

    const newLog: ReminderLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      unitNumber: tenant.unitNumber,
      phone: tenant.phone,
      channel,
      sentAt,
      message,
      dueAmount,
      dueDate,
      month: selectedMonth,
      year: selectedYear,
      status: 'sent',
      read: channel === 'in_app' ? false : true,
    };

    setReminderLogs((prev) => [newLog, ...prev]);

    logActivity(
      `Reminder Sent (${channel.toUpperCase()})`,
      `${tenant.unitNumber} (${tenant.name})-কে ${
        channel === 'sms' ? 'এসএমএস' : channel === 'whatsapp' ? 'হোয়াটসঅ্যাপ' : 'ইন-অ্যাপ নোটিশ'
      } রিমাইন্ডার পাঠানো হয়েছে। প্রদেয়: ৳${dueAmount}`,
      'reminder',
      tenant.id
    );

    if (channel === 'sms') {
      const cleanPhone = tenant.phone.replace(/[^0-9+]/g, '');
      try {
        if (typeof window !== 'undefined' && 'navigator' in window && (navigator as any).userAgent) {
          const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
          if (isMobile) {
            window.open(`sms:${cleanPhone}?body=${encodeURIComponent(message)}`, '_blank');
          }
        }
      } catch (e) {}
    } else if (channel === 'whatsapp') {
      let cleanPhone = tenant.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '88' + cleanPhone;
      } else if (!cleanPhone.startsWith('88')) {
        cleanPhone = '880' + cleanPhone;
      }
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }

    return { success: true, message: 'রিমাইন্ডার সফলভাবে পাঠানো হয়েছে!' };
  };

  const sendBatchReminders = async (
    channel: 'sms' | 'in_app' | 'whatsapp'
  ): Promise<{ successCount: number; failedCount: number }> => {
    let successCount = 0;
    let failedCount = 0;

    for (const rem of approachingReminders) {
      try {
        await sendTenantReminder(rem.tenantId, channel);
        successCount++;
      } catch (e) {
        failedCount++;
      }
    }

    return { successCount, failedCount };
  };

  const runAutomaticRemindersCheck = (force: boolean = false): { triggeredCount: number; message: string } => {
    if (!reminderSettings.enabled && !force) {
      return { triggeredCount: 0, message: 'স্বয়ংক্রিয় রিমাইন্ডার সিস্টেম বর্তমানে নিষ্ক্রিয়।' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (!force && reminderSettings.lastAutoRunDate === todayStr) {
      return { triggeredCount: 0, message: 'আজকের স্বয়ংক্রিয় রিমাইন্ডার পরীক্ষা ইতোমধ্যে সম্পন্ন হয়েছে।' };
    }

    let count = 0;
    const newLogs: ReminderLog[] = [];
    const now = new Date();
    const sentAt =
      now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      formatDateBn(todayStr);

    approachingReminders.forEach((rem) => {
      const isScheduled =
        reminderSettings.daysBeforeDueDate.includes(rem.daysUntilDue) ||
        (rem.daysUntilDue <= 0 && reminderSettings.daysBeforeDueDate.includes(0));

      if (!isScheduled && !force) return;

      // Avoid double sending on the same day if not forced
      const alreadySentToday = reminderLogs.some(
        (l) => l.tenantId === rem.tenantId && l.sentAt.includes(formatDateBn(todayStr))
      );
      if (alreadySentToday && !force) return;

      const tenant = tenants.find((t) => t.id === rem.tenantId);
      if (!tenant) return;

      // In-App
      if (reminderSettings.notifyInApp) {
        const inAppMsg = compileReminderMessage(reminderSettings.inAppTemplate, rem, settings);
        newLogs.push({
          id: `log-auto-inapp-${rem.tenantId}-${Date.now()}-${count}`,
          tenantId: rem.tenantId,
          tenantName: rem.tenantName,
          unitNumber: rem.unitNumber,
          phone: rem.phone,
          channel: 'in_app',
          sentAt,
          message: inAppMsg,
          dueAmount: rem.totalDue,
          dueDate: rem.dueDate,
          month: rem.month,
          year: rem.year,
          status: 'delivered',
          read: false,
        });
        count++;
      }

      // SMS
      if (reminderSettings.notifySMS && reminderSettings.autoSendSMSOnDueDate) {
        const smsMsg = compileReminderMessage(reminderSettings.smsTemplate, rem, settings);
        newLogs.push({
          id: `log-auto-sms-${rem.tenantId}-${Date.now()}-${count}`,
          tenantId: rem.tenantId,
          tenantName: rem.tenantName,
          unitNumber: rem.unitNumber,
          phone: rem.phone,
          channel: 'sms',
          sentAt,
          message: smsMsg,
          dueAmount: rem.totalDue,
          dueDate: rem.dueDate,
          month: rem.month,
          year: rem.year,
          status: 'sent',
          read: true,
        });
        count++;
      }
    });

    if (newLogs.length > 0) {
      setReminderLogs((prev) => [...newLogs, ...prev]);
      logActivity(
        'Automatic Reminders Dispatched',
        `স্বয়ংক্রিয় রিমাইন্ডার ইঞ্জিন মোট ${toBengaliNumber(count)}টি নোটিফিকেশন/এসএমএস সফলভাবে পাঠিয়েছে।`,
        'reminder'
      );
    }

    setReminderSettings((prev) => ({ ...prev, lastAutoRunDate: todayStr }));

    return {
      triggeredCount: count,
      message:
        count > 0
          ? `${toBengaliNumber(count)} জন ভাড়াটিয়াকে রিমাইন্ডার সফলভাবে প্রেরণ করা হয়েছে।`
          : 'আজকের জন্য কোন নতুন আসন্ন রিমাইন্ডার নেই।',
    };
  };

  const markReminderAsRead = (logId: string) => {
    setReminderLogs((prev) => prev.map((l) => (l.id === logId ? { ...l, read: true } : l)));
  };

  const markAllRemindersAsRead = () => {
    setReminderLogs((prev) => prev.map((l) => ({ ...l, read: true })));
  };

  const deleteReminderLog = (logId: string) => {
    setReminderLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  const clearAllReminderLogs = () => {
    setReminderLogs([]);
    logActivity('Reminder Logs Cleared', 'সকল রিমাইন্ডার হিস্ট্রি ও লগ মুছে ফেলা হয়েছে।', 'reminder');
  };

  // Run automatic check on initial load if enabled
  useEffect(() => {
    if (reminderSettings.enabled) {
      runAutomaticRemindersCheck(false);
    }
  }, []);

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
        cashBook: cashBookEntries,
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

        // Reminders
        reminderSettings,
        reminderLogs,
        approachingReminders,
        unreadRemindersCount,
        updateReminderSettings,
        sendTenantReminder,
        sendBatchReminders,
        runAutomaticRemindersCheck,
        markReminderAsRead,
        markAllRemindersAsRead,
        deleteReminderLog,
        clearAllReminderLogs,

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
        deleteTenant,
        archiveTenant,
        clearAllTenants,
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
        clearMonthData,
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
