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

export const INITIAL_SETTINGS: AppSettings = {
  propertyName: 'Noor Tower Commercial & Residential Complex',
  propertyNameBn: 'নূর টাওয়ার কমার্শিয়াল ও রেসিডেন্সিয়াল কমপ্লেক্স',
  address: 'Plot 42, Road 11, Sector 4, Uttara, Dhaka-1230',
  addressBn: 'প্লট ৪২, রোড ১১, সেক্টর ৪, উত্তরা, ঢাকা-১২৩০',
  phone: '+880 1711-234567, +880 1819-890123',
  email: 'info@noortowerbd.com',
  logoUrl: '',
  currency: 'BDT',
  currencySymbol: '৳',
  defaultRentDueDate: 10,
  lateFee: 500,
  billGenerationDay: 1,
  receiptNumberFormat: 'RCT-YYYY-MM-XXXX',
  financialYear: '2026-2027',
  openingCashBalance: 250000,
};

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-1',
    name: 'মোঃ শওকত কামাল (MD SHAWKAT KAMAL)',
    nameBn: 'মোঃ শওকত কামাল',
    role: 'owner',
    email: 'mdshawkatkamal@gmail.com',
    phone: '01711234567',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'usr-2',
    name: 'শোভা (SHOVA)',
    nameBn: 'শোভা',
    role: 'manager',
    email: 'shova.manager@noortower.com',
    phone: '01819890123',
    status: 'active',
    createdAt: '2025-02-15',
  },
];

// Helper to generate 80 flats and 20 shops
export function generateSeedPropertiesAndTenants() {
  const flats: Flat[] = [];
  const shops: Shop[] = [];
  const tenants: Tenant[] = [];

  const tenantNames = [
    { name: 'Abdur Rahim', nameBn: 'আব্দুর রহিম', phone: '01712001001', email: 'rahim101@gmail.com', nid: '1984269123456' },
    { name: 'Dr. Fazle Rabbi', nameBn: 'ডাঃ ফজলে রাব্বী', phone: '01712001002', email: 'rabbi.dr@yahoo.com', nid: '1978269123457' },
    { name: 'Engr. Mahmudul Hasan', nameBn: 'ইঞ্জিঃ মাহমুদুল হাসান', phone: '01819001003', email: 'mahmud.buet@gmail.com', nid: '1989269123458' },
    { name: 'Kamrul Ahsan', nameBn: 'কামরুল আহসান', phone: '01911001004', email: 'kamrul.ahsan@gmail.com', nid: '1985269123459' },
    { name: 'Nurul Islam Chowdhury', nameBn: 'নুরুল ইসলাম চৌধুরী', phone: '01611001005', email: 'nurul.chy@gmail.com', nid: '1975269123460' },
    { name: 'Advocate Shamsul Alam', nameBn: 'এডভোকেট শামসুল আলম', phone: '01713001006', email: 'shamsul.law@gmail.com', nid: '1982269123461' },
    { name: 'Moniruzzaman Monir', nameBn: 'মনিরুজ্জামান মনির', phone: '01815001007', email: 'monir.dhaka@gmail.com', nid: '1990269123462' },
    { name: 'Ashraf Ali Bhuiyan', nameBn: 'আশরাফ আলী ভূঁইয়া', phone: '01914001008', email: 'ashraf.ali@gmail.com', nid: '1981269123463' },
    { name: 'Prof. Anisur Rahman', nameBn: 'প্রফেসর আনিসুর রহমান', phone: '01715001009', email: 'prof.anis@du.ac.bd', nid: '1968269123464' },
    { name: 'Syed Tanvir Ahmed', nameBn: 'সৈয়দ তানভীর আহমেদ', phone: '01816001010', email: 'tanvir.ahmed@gmail.com', nid: '1992269123465' },
    { name: 'Abdul Karim', nameBn: 'আব্দুল করিম', phone: '01712001011', email: 'karim.dhaka@gmail.com', nid: '1983269123466' },
    { name: 'Mustafizur Rahman', nameBn: 'মুস্তাফিজুর রহমান', phone: '01912001012', email: 'mustafiz@gmail.com', nid: '1987269123467' },
    { name: 'Shahidul Alam', nameBn: 'শহিদুল আলম', phone: '01812001013', email: 'shahidul@gmail.com', nid: '1980269123468' },
    { name: 'Farhan Kabir', nameBn: 'ফারহান কবির', phone: '01612001014', email: 'farhan.k@gmail.com', nid: '1994269123469' },
    { name: 'Nasimul Gani', nameBn: 'নাসিমুল গনি', phone: '01717001015', email: 'nasimul.g@gmail.com', nid: '1979269123470' },
  ];

  let tenantCounter = 0;

  // 80 Flats (8 floors, 10 flats per floor: F-101 to F-810)
  for (let floor = 1; floor <= 8; floor++) {
    for (let unit = 1; unit <= 10; unit++) {
      const flatNum = `F-${floor}${unit < 10 ? '0' + unit : unit}`;
      const isVacant = (floor === 7 && unit === 9) || (floor === 8 && unit === 10);
      const isReserved = floor === 8 && unit === 9;
      const status: 'occupied' | 'vacant' | 'reserved' = isVacant
        ? 'vacant'
        : isReserved
        ? 'reserved'
        : 'occupied';

      const baseRent = floor <= 3 ? 22000 : floor <= 6 ? 24000 : 25000;
      const flatId = `flat-${floor}-${unit}`;

      let tenantId: string | undefined = undefined;

      if (status === 'occupied') {
        const sampleT = tenantNames[tenantCounter % tenantNames.length];
        tenantCounter++;
        tenantId = `tnt-flat-${floor}-${unit}`;

        tenants.push({
          id: tenantId,
          name: sampleT.name,
          phone: sampleT.phone,
          email: sampleT.email,
          address: `House 12, Village/Area, Post, District`,
          nid: sampleT.nid,
          unitType: 'flat',
          unitId: flatId,
          unitNumber: flatNum,
          monthlyRent: baseRent,
          agreementStart: '2025-01-01',
          agreementEnd: '2026-12-31',
          securityDeposit: baseRent * 2,
          emergencyContact: {
            name: 'Brother/Relative',
            relation: 'Brother',
            phone: '01799887766',
          },
          status: 'active',
          createdAt: '2025-01-01',
        });
      }

      flats.push({
        id: flatId,
        flatNumber: flatNum,
        floor,
        size: 1250,
        rent: baseRent,
        tenantId,
        startDate: status === 'occupied' ? '2025-01-01' : undefined,
        status,
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

  // 20 Shops (Ground Floor S-01 to S-10, 1st Floor S-11 to S-20)
  const businessNames = [
    'Al-Madina Pharmacy & Health Care',
    'Bismillah Grocery & Super Shop',
    'Rahmat Electronics & Mobile Care',
    'Uttara Dental Care & Implant Center',
    'Standard Chartered Bank ATM Booth',
    'Bengal Sweets & Bakery',
    'Modern Optical & Eye Care',
    'Popular Diagnostic Collection Booth',
    'Apex Shoes & Leather Gallery',
    'Grameenphone Express Center',
    'Bata Shoes Showroom',
    'Aarong Dairy & Meat Outlet',
    'Daily Shopping Convenience',
    'Chittagong Fabrics & Tailors',
    'Coffee Glory Cafe & Fast Food',
    'Dhaka Hardware & Sanitaries',
    'Master Clean Dry Cleaners',
    'City IT Solutions & CCTV',
    'Bhai Bhai Telecom & Accessories',
    'Al-Amin Books & Stationery',
  ];

  for (let i = 1; i <= 20; i++) {
    const shopNum = `S-${i < 10 ? '0' + i : i}`;
    const floor = i <= 10 ? 0 : 1;
    const isVacant = i === 19;
    const status: 'occupied' | 'vacant' | 'reserved' = isVacant ? 'vacant' : 'occupied';
    const rent = floor === 0 ? 35000 : 28000;
    const shopId = `shop-${i}`;

    let tenantId: string | undefined = undefined;

    if (status === 'occupied') {
      const sampleT = tenantNames[i % tenantNames.length];
      tenantId = `tnt-shop-${i}`;

      tenants.push({
        id: tenantId,
        name: sampleT.name,
        phone: sampleT.phone,
        email: `shop.${i}@noortowerbd.com`,
        address: 'Uttara Business Hub, Dhaka',
        nid: sampleT.nid,
        unitType: 'shop',
        unitId: shopId,
        unitNumber: shopNum,
        monthlyRent: rent,
        agreementStart: '2024-06-01',
        agreementEnd: '2027-05-31',
        securityDeposit: rent * 3,
        emergencyContact: {
          name: 'Manager Incharge',
          relation: 'Store Manager',
          phone: '01888776655',
        },
        status: 'active',
        createdAt: '2024-06-01',
      });
    }

    shops.push({
      id: shopId,
      shopNumber: shopNum,
      floor,
      size: 450,
      rent,
      businessName: businessNames[i - 1] || `Business Unit ${i}`,
      tenantId,
      startDate: status === 'occupied' ? '2024-06-01' : undefined,
      status,
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
  flats: Flat[],
  shops: Shop[],
  tenants: Tenant[]
) {
  const bills: Bill[] = [];
  const payments: Payment[] = [];
  const expenses: Expense[] = [];
  const cashBookEntries: CashBookEntry[] = [];
  const activityLogs: ActivityLog[] = [];

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'];
  const year = 2026;

  // Let's create past monthly summary data & detailed August 2026 data
  // For August 2026, generate bills for all occupied units
  const currentMonth = 'August';
  let billSeq = 1;
  let receiptSeq = 1;

  // Generate bills for each active tenant for August 2026
  tenants.forEach((tenant) => {
    const isFlat = tenant.unitType === 'flat';
    const unit = isFlat
      ? flats.find((f) => f.id === tenant.unitId)
      : shops.find((s) => s.id === tenant.unitId);

    const rent = tenant.monthlyRent || (unit?.rent || 20000);
    const charges = unit?.monthlyCharges || {
      electricity: 2500,
      water: 600,
      gas: 1000,
      serviceCharge: 1500,
      other: 400,
    };

    const total =
      rent +
      charges.electricity +
      charges.water +
      charges.gas +
      charges.serviceCharge +
      charges.other;

    const billId = `bil-${year}-08-${String(billSeq).padStart(4, '0')}`;
    const billNumber = `BIL-${year}-08-${String(billSeq).padStart(4, '0')}`;
    billSeq++;

    // Distribution: 80% paid, 12% partial paid, 8% unpaid
    const rand = (billSeq * 17) % 100;
    let paidAmount = 0;
    let dueAmount = total;
    let status: 'paid' | 'partial' | 'unpaid' | 'overdue' = 'unpaid';

    if (rand < 75) {
      paidAmount = total;
      dueAmount = 0;
      status = 'paid';
    } else if (rand < 90) {
      // Partial payment (e.g. rent paid, utilities due)
      paidAmount = Math.floor(rent);
      dueAmount = total - paidAmount;
      status = 'partial';
    } else {
      paidAmount = 0;
      dueAmount = total;
      status = 'unpaid';
    }

    const bill: Bill = {
      id: billId,
      billNumber,
      month: currentMonth,
      year,
      date: '2026-08-01',
      dueDate: '2026-08-10',
      unitType: tenant.unitType,
      unitId: tenant.unitId,
      unitNumber: tenant.unitNumber,
      tenantId: tenant.id,
      tenantName: tenant.name,
      items: {
        rent,
        electricity: charges.electricity,
        water: charges.water,
        gas: charges.gas,
        serviceCharge: charges.serviceCharge,
        other: charges.other,
      },
      totalAmount: total,
      paidAmount,
      dueAmount,
      status,
      generatedBy: 'শোভা (SHOVA) [Manager]',
      createdAt: '2026-08-01T09:00:00Z',
    };
    bills.push(bill);

    // If paid or partial, create payment record & cash book entry
    if (paidAmount > 0) {
      const receiptNo = `RCT-${year}-08-${String(receiptSeq).padStart(4, '0')}`;
      receiptSeq++;
      const paymentId = `pmt-${year}-08-${receiptSeq}`;

      const paymentMethod = rand % 3 === 0 ? 'bank' : rand % 2 === 0 ? 'mobile_banking' : 'cash';

      const payment: Payment = {
        id: paymentId,
        receiptNumber: receiptNo,
        tenantId: tenant.id,
        tenantName: tenant.name,
        unitType: tenant.unitType,
        unitId: tenant.unitId,
        unitNumber: tenant.unitNumber,
        month: currentMonth,
        year,
        billId: bill.id,
        paymentDate: `2026-08-${String(Math.min(28, (rand % 15) + 2)).padStart(2, '0')}`,
        amount: paidAmount,
        paymentMethod,
        reference: paymentMethod === 'mobile_banking' ? `TrxID-9K${rand}X82` : paymentMethod === 'bank' ? `CHQ-${440000 + rand}` : undefined,
        receivedBy: 'শোভা (SHOVA)',
        createdAt: '2026-08-05T11:30:00Z',
      };
      payments.push(payment);

      cashBookEntries.push({
        id: `cb-in-${receiptSeq}`,
        date: payment.paymentDate,
        month: currentMonth,
        year,
        type: 'in',
        category: 'Rent Collection',
        description: `Rent from ${tenant.name} (${tenant.unitNumber}) for August 2026`,
        amount: paidAmount,
        sourceOrPayee: tenant.name,
        referenceId: payment.id,
        recordedBy: 'শোভা (SHOVA)',
        createdAt: payment.createdAt,
      });
    }
  });

  // Add Expenses for August 2026
  const augustExpenses = [
    {
      category: 'Electricity Common Area' as const,
      title: 'DESCO Common Area & Lift Electricity Bill (August)',
      amount: 18500,
      date: '2026-08-08',
      paidTo: 'DESCO Dhaka',
      paidBy: 'শোভা (SHOVA)',
      paymentMethod: 'bank' as const,
    },
    {
      category: 'Cleaner Salary' as const,
      title: 'Monthly Salary for 4 Cleaning Staff (August)',
      amount: 28000,
      date: '2026-08-05',
      paidTo: 'Cleaning Team Supervisor',
      paidBy: 'মোঃ শওকত কামাল (MD SHAWKAT KAMAL)',
      paymentMethod: 'cash' as const,
    },
    {
      category: 'Security Salary' as const,
      title: 'Security Guard Agency Monthly Bill (4 Guards, 24/7)',
      amount: 36000,
      date: '2026-08-05',
      paidTo: 'Elite Force Security Ltd.',
      paidBy: 'মোঃ শওকত কামাল (MD SHAWKAT KAMAL)',
      paymentMethod: 'bank' as const,
    },
    {
      category: 'Maintenance' as const,
      title: 'Water Pump Repair & Motor Servicing',
      amount: 14500,
      date: '2026-08-12',
      paidTo: 'Uddin Engineering Works',
      paidBy: 'শোভা (SHOVA)',
      paymentMethod: 'cash' as const,
    },
    {
      category: 'Generator/Lift' as const,
      title: 'Diesel Fuel for Backup Generator (80 Liters)',
      amount: 9200,
      date: '2026-08-18',
      paidTo: 'Padma Oil Filling Station',
      paidBy: 'শোভা (SHOVA)',
      paymentMethod: 'cash' as const,
    },
    {
      category: 'Water & Sanitation' as const,
      title: 'Dhaka WASA Monthly Commercial Water Supply Bill',
      amount: 8500,
      date: '2026-08-10',
      paidTo: 'Dhaka WASA Zone-9',
      paidBy: 'মোঃ শওকত কামাল (MD SHAWKAT KAMAL)',
      paymentMethod: 'bank' as const,
    },
    {
      category: 'Office Expense' as const,
      title: 'Receipt Books Printing, Stationery & Internet Bill',
      amount: 5300,
      date: '2026-08-02',
      paidTo: 'Dhaka Stationery & Link3 ISP',
      paidBy: 'শোভা (SHOVA)',
      paymentMethod: 'cash' as const,
    },
  ];

  augustExpenses.forEach((exp, idx) => {
    const expId = `exp-2026-08-${idx + 1}`;
    expenses.push({
      id: expId,
      voucherNumber: `EXP-2026-08-${String(idx + 1).padStart(3, '0')}`,
      date: exp.date,
      month: 'August',
      year: 2026,
      category: exp.category,
      title: exp.title,
      amount: exp.amount,
      paymentMethod: exp.paymentMethod,
      paidTo: exp.paidTo,
      paidBy: exp.paidBy,
      createdAt: `${exp.date}T10:00:00Z`,
    });

    cashBookEntries.push({
      id: `cb-out-${idx + 1}`,
      date: exp.date,
      month: 'August',
      year: 2026,
      type: 'out',
      category: exp.category,
      description: exp.title,
      amount: exp.amount,
      sourceOrPayee: exp.paidTo,
      referenceId: expId,
      recordedBy: exp.paidBy,
      createdAt: `${exp.date}T10:00:00Z`,
    });
  });

  // Seed Activity Logs
  activityLogs.push(
    {
      id: 'act-1',
      timestamp: '2026-08-01 09:15 AM',
      userRole: 'manager',
      userName: 'শোভা (SHOVA)',
      action: 'Generate Monthly Bills',
      details: 'Manager generated 97 active bills for August 2026',
      entityType: 'bill',
    },
    {
      id: 'act-2',
      timestamp: '2026-08-02 11:30 AM',
      userRole: 'manager',
      userName: 'শোভা (SHOVA)',
      action: 'Payment Received',
      details: 'Received ৳27,000 from Abdur Rahim for Flat F-101 (August 2026)',
      entityType: 'payment',
    },
    {
      id: 'act-3',
      timestamp: '2026-08-05 02:45 PM',
      userRole: 'owner',
      userName: 'মোঃ শওকত কামাল (MD SHAWKAT KAMAL)',
      action: 'Expense Approved & Paid',
      details: 'Paid Security Agency Monthly Bill ৳36,000 via Bank',
      entityType: 'expense',
    },
    {
      id: 'act-4',
      timestamp: '2026-08-12 04:20 PM',
      userRole: 'manager',
      userName: 'শোভা (SHOVA)',
      action: 'Add Maintenance Expense',
      details: 'Added Water Pump Repair & Motor Servicing expense ৳14,500',
      entityType: 'expense',
    },
    {
      id: 'act-5',
      timestamp: '2026-08-18 10:10 AM',
      userRole: 'manager',
      userName: 'শোভা (SHOVA)',
      action: 'Tenant Agreement Update',
      details: 'Updated tenant contact details for Al-Madina Pharmacy (Shop S-01)',
      entityType: 'tenant',
    }
  );

  return { bills, payments, expenses, cashBookEntries, activityLogs };
}
