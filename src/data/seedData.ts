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
} from '../types';

export const DEFAULT_REMINDER_SETTINGS = {
  enabled: true,
  notifyInApp: true,
  notifySMS: true,
  notifyWhatsApp: true,
  daysBeforeDueDate: [5, 3, 1, 0],
  smsTemplate: 'আসসালামু আলাইকুম {TENANT_NAME} সাহেব, তুলতুল ভিলা ({UNIT_NUMBER})-এর {MONTH} মাসের ভাড়া ও ইউটিলিটি বিল মোট ৳{DUE_AMOUNT} পরিশোধের শেষ তারিখ {DUE_DATE} ({DAYS_LEFT})। নির্ধারিত সময়ের মধ্যে পরিশোধের অনুরোধ রইলো। - {PROPERTY_NAME}, যোগাযোগ: {PAYMENT_PHONE}',
  inAppTemplate: '{UNIT_NUMBER} ({TENANT_NAME})-এর {MONTH} মাসের ভাড়া পরিশোধের শেষ তারিখ {DUE_DATE} ({DAYS_LEFT})। মোট প্রদেয়: ৳{DUE_AMOUNT}।',
  autoSendSMSOnDueDate: false,
  smsGatewayProvider: 'simulation' as const,
  senderPhone: '+880 1711-234567',
  lastAutoRunDate: '',
};

export const INITIAL_SETTINGS: AppSettings = {
  propertyName: 'TulTul Villa',
  propertyNameBn: 'তুলতুল ভিলা',
  address: 'Plot 42, Road 11, Sector 4, Uttara, Dhaka-1230',
  addressBn: 'প্লট ৪২, রোড ১১, সেক্টর ৪, উত্তরা, ঢাকা-১২৩০',
  phone: '+880 1711-234567, +880 1819-890123',
  email: 'info@tultulvilla.com',
  logoUrl: '',
  currency: 'BDT',
  currencySymbol: '৳',
  defaultRentDueDate: 10,
  lateFee: 500,
  billGenerationDay: 1,
  receiptNumberFormat: 'RCT-YYYY-MM-XXXX',
  financialYear: '2026-2027',
  openingCashBalance: 250000,
  reminderSettings: DEFAULT_REMINDER_SETTINGS,
};

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-1',
    name: 'মোঃ শওকত কামাল (MD SHAWKAT KAMAL)',
    nameBn: 'মোঃ শওকত কামাল',
    username: 'shawkat',
    password: 'password123',
    role: 'owner',
    email: 'mdshawkatkamal@gmail.com',
    phone: '01711234567',
    status: 'active',
    createdAt: '2025-01-01',
    lastLogin: '2026-08-29 09:30 AM',
  },
  {
    id: 'usr-2',
    name: 'শোভা (SHOVA)',
    nameBn: 'শোভা',
    username: 'shova',
    password: 'password123',
    role: 'manager',
    email: 'shova.manager@tultulvilla.com',
    phone: '01819890123',
    status: 'active',
    createdAt: '2025-02-15',
    lastLogin: '2026-08-28 04:15 PM',
  },
];

// Helper to generate 80 flats and 20 shops (All vacant, ready for fresh tenant entries)
export function generateSeedPropertiesAndTenants() {
  const flats: Flat[] = [];
  const shops: Shop[] = [];
  const tenants: Tenant[] = [];

  // 80 Flats (8 floors, 10 flats per floor: F-101 to F-810) - All ready for new tenant assignment
  for (let floor = 1; floor <= 8; floor++) {
    for (let unit = 1; unit <= 10; unit++) {
      const flatNum = `F-${floor}${unit < 10 ? '0' + unit : unit}`;
      const baseRent = floor <= 3 ? 22000 : floor <= 6 ? 24000 : 25000;
      const flatId = `flat-${floor}-${unit}`;

      flats.push({
        id: flatId,
        flatNumber: flatNum,
        floor,
        size: 1250,
        rent: baseRent,
        tenantId: undefined,
        startDate: undefined,
        status: 'vacant',
        monthlyCharges: {
          electricity: 2500,
          water: 600,
          gas: 1080,
          serviceCharge: 1500,
          other: 320,
        },
      });
    }
  }

  // 20 Shops (Ground Floor S-01 to S-10, 1st Floor S-11 to S-20) - All vacant
  const shopCategoryNames = [
    'দোকান নং ১ (গ্রাউন্ড ফ্লোর)',
    'দোকান নং ২ (গ্রাউন্ড ফ্লোর)',
    'দোকান নং ৩ (গ্রাউন্ড ফ্লোর)',
    'দোকান নং ৪ (গ্রাউন্ড ফ্লোর)',
    'দোকান নং ৫ (গ্রাউন্ড ফ্লোর)',
    'দোকান নং ৬ (গ্রাউন্ড ফ্লোর)',
    'দোকান নং ৭ (গ্রাউন্ড ফ্লোর)',
    'দোকান নং ৮ (গ্রাউন্ড ফ্লোর)',
    'দোকান নং ৯ (গ্রাউন্ড ফ্লোর)',
    'দোকান নং ১০ (গ্রাউন্ড ফ্লোর)',
    'দোকান নং ১১ (১ম তলা)',
    'দোকান নং ১২ (১ম তলা)',
    'দোকান নং ১৩ (১ম তলা)',
    'দোকান নং ১৪ (১ম তলা)',
    'দোকান নং ১৫ (১ম তলা)',
    'দোকান নং ১৬ (১ম তলা)',
    'দোকান নং ১৭ (১ম তলা)',
    'দোকান নং ১৮ (১ম তলা)',
    'দোকান নং ১৯ (১ম তলা)',
    'দোকান নং ২০ (১ম তলা)',
  ];

  for (let i = 1; i <= 20; i++) {
    const shopNum = `S-${i < 10 ? '0' + i : i}`;
    const floor = i <= 10 ? 0 : 1;
    const rent = floor === 0 ? 35000 : 28000;
    const shopId = `shop-${i}`;

    shops.push({
      id: shopId,
      shopNumber: shopNum,
      floor,
      size: 450,
      rent,
      businessName: shopCategoryNames[i - 1] || `Shop ${shopNum}`,
      tenantId: undefined,
      startDate: undefined,
      status: 'vacant',
      monthlyCharges: {
        electricity: 3500,
        water: 500,
        gas: 0,
        serviceCharge: 2000,
        other: 500,
      },
    });
  }

  return { flats, shops, tenants };
}

export function generateSeedBillsAndPayments(
  _flats: Flat[],
  _shops: Shop[],
  _tenants: Tenant[]
) {
  const bills: Bill[] = [];
  const payments: Payment[] = [];
  const expenses: Expense[] = [];
  const cashBookEntries: CashBookEntry[] = [];
  const activityLogs: ActivityLog[] = [];

  // Initial zeroed state for August 2026 as requested
  // Activity log tracking system readiness
  activityLogs.push(
    {
      id: 'act-1',
      timestamp: '2026-08-01 09:00 AM',
      userRole: 'owner',
      userName: 'মোঃ শওকত কামাল (MD SHAWKAT KAMAL)',
      action: 'System Initialized',
      details: 'তুলতুল ভিলা প্রপার্টি ম্যানেজমেন্ট সিস্টেম প্রস্তুত হয়েছে (আগস্ট ২০২৬ বিল ও খরচ ০ হিসাবে সেট করা হয়েছে)।',
      entityType: 'setting',
    }
  );

  return { bills, payments, expenses, cashBookEntries, activityLogs };
}
