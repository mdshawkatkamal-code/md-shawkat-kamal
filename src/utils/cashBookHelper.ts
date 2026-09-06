import { Payment, Expense, CashBookEntry } from '../types';
import { MONTHS } from './formatters';

export interface UnifiedCashTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  month: string;
  year: number;
  type: 'inflow' | 'outflow';
  category: string;
  description: string;
  sourceOrPayee: string;
  referenceNo: string;
  paymentMethod: string;
  amount: number;
  runningBalance: number;
  originalType: 'payment' | 'expense' | 'cashbook';
  recordedBy?: string;
}

export interface CashPeriodSummary {
  periodOpeningBalance: number;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  periodClosingBalance: number;
  transactionsCount: number;
  inflowCount: number;
  outflowCount: number;
  cashInflowTotal: number;
  bankInflowTotal: number;
  mobileInflowTotal: number;
  cashOutflowTotal: number;
  bankOutflowTotal: number;
}

/**
 * Reconciles payments, expenses, and manual cash book entries into a unified,
 * chronological cash ledger with running balances.
 */
export function compileCashTransactions(
  payments: Payment[] = [],
  expenses: Expense[] = [],
  cashBookEntries: CashBookEntry[] = [],
  baseOpeningBalance: number = 250000
): UnifiedCashTransaction[] {
  const unifiedList: Omit<UnifiedCashTransaction, 'runningBalance'>[] = [];

  // 1. Inflows from tenant payments
  const existingPaymentRefIds = new Set<string>();
  payments.forEach((p) => {
    existingPaymentRefIds.add(p.id);
    if (p.receiptNumber) existingPaymentRefIds.add(p.receiptNumber);

    const unitLabel = p.unitNumber ? `[${p.unitNumber}]` : '';
    const desc = p.notes
      ? `${p.tenantName} ${unitLabel} - ভাড়া আদায় (${p.notes})`
      : `${p.tenantName} ${unitLabel} - মাসিক ভাড়া ও ইউটিলিটি আদায়`;

    unifiedList.push({
      id: `p-${p.id}`,
      date: p.paymentDate || p.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      month: p.month,
      year: p.year,
      type: 'inflow',
      category: 'ভাড়া ও ইউটিলিটি আদায়',
      description: desc,
      sourceOrPayee: p.tenantName || 'ভাড়াটিয়া',
      referenceNo: p.receiptNumber || p.reference || p.id,
      paymentMethod: p.paymentMethod || 'cash',
      amount: Number(p.amount) || 0,
      originalType: 'payment',
      recordedBy: p.receivedBy,
    });
  });

  // 2. Outflows from building expenses
  const existingExpenseRefIds = new Set<string>();
  expenses.forEach((e) => {
    existingExpenseRefIds.add(e.id);
    if (e.voucherNumber) existingExpenseRefIds.add(e.voucherNumber);

    const payeeInfo = e.paidTo ? ` (প্রাপক: ${e.paidTo})` : '';
    const desc = `${e.title || e.category}${payeeInfo}`;

    unifiedList.push({
      id: `e-${e.id}`,
      date: e.date || e.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      month: e.month,
      year: e.year,
      type: 'outflow',
      category: typeof e.category === 'string' ? e.category : 'পরিচালন ব্যয়',
      description: desc,
      sourceOrPayee: e.paidTo || e.title || 'খরচ',
      referenceNo: e.voucherNumber || e.id,
      paymentMethod: e.paymentMethod || 'cash',
      amount: Number(e.amount) || 0,
      originalType: 'expense',
      recordedBy: e.paidBy,
    });
  });

  // 3. Manual CashBook entries (avoiding duplicate payment/expense records)
  cashBookEntries.forEach((cb) => {
    // If this entry references an already-included payment or expense, skip it
    if (cb.referenceId && (existingPaymentRefIds.has(cb.referenceId) || existingExpenseRefIds.has(cb.referenceId))) {
      return;
    }

    const isEntryInflow = cb.type === 'in' || (cb as any).type === 'inflow';

    unifiedList.push({
      id: `cb-${cb.id}`,
      date: cb.date || cb.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      month: cb.month || 'August',
      year: cb.year || 2026,
      type: isEntryInflow ? 'inflow' : 'outflow',
      category: cb.category || (isEntryInflow ? 'অন্যান্য নগদ প্রাপ্তি' : 'অন্যান্য নগদ খরচ'),
      description: cb.description || (isEntryInflow ? 'নগদ জমা' : 'নগদ ব্যয়'),
      sourceOrPayee: cb.sourceOrPayee || 'ক্যাশ কাউন্টার',
      referenceNo: cb.referenceId || (cb as any).reference || cb.id,
      paymentMethod: 'cash',
      amount: Number(cb.amount) || 0,
      originalType: 'cashbook',
      recordedBy: cb.recordedBy,
    });
  });

  // 4. Sort chronologically (oldest date first)
  unifiedList.sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    if (timeA !== timeB) return timeA - timeB;
    return a.id.localeCompare(b.id);
  });

  // 5. Calculate cumulative running balance
  let currentBalance = baseOpeningBalance;
  const result: UnifiedCashTransaction[] = [];

  for (const item of unifiedList) {
    if (item.type === 'inflow') {
      currentBalance += item.amount;
    } else {
      currentBalance -= item.amount;
    }
    result.push({
      ...item,
      runningBalance: currentBalance,
    });
  }

  return result;
}

/**
 * Filter transactions for a given period and compute the period's opening,
 * inflow, outflow, net cash flow, and closing balance.
 */
export function getPeriodCashSummary(
  allTransactions: UnifiedCashTransaction[],
  options: {
    month?: string;
    year?: number;
    startDate?: string;
    endDate?: string;
    allTime?: boolean;
    baseOpeningBalance?: number;
  }
): {
  filteredTransactions: UnifiedCashTransaction[];
  summary: CashPeriodSummary;
} {
  const {
    month,
    year,
    startDate,
    endDate,
    allTime = false,
    baseOpeningBalance = 250000,
  } = options;

  let periodTransactions: UnifiedCashTransaction[] = [];
  let priorTransactions: UnifiedCashTransaction[] = [];

  if (allTime) {
    periodTransactions = [...allTransactions];
    priorTransactions = [];
  } else if (startDate && endDate) {
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime() + 86400000 - 1; // inclusive of end day

    periodTransactions = allTransactions.filter((t) => {
      const tMs = new Date(t.date).getTime();
      return tMs >= startMs && tMs <= endMs;
    });

    priorTransactions = allTransactions.filter((t) => {
      const tMs = new Date(t.date).getTime();
      return tMs < startMs;
    });
  } else if (month && year) {
    // Standard Month + Year filter
    const monthIndex = MONTHS.indexOf(month as any);
    const targetYear = year;

    periodTransactions = allTransactions.filter(
      (t) => t.month === month && t.year === year
    );

    priorTransactions = allTransactions.filter((t) => {
      if (t.year < targetYear) return true;
      if (t.year === targetYear) {
        const tMonthIndex = MONTHS.indexOf(t.month as any);
        return tMonthIndex !== -1 && tMonthIndex < monthIndex;
      }
      return false;
    });
  } else {
    periodTransactions = [...allTransactions];
    priorTransactions = [];
  }

  // Calculate opening balance before period start
  let periodOpeningBalance = baseOpeningBalance;
  for (const t of priorTransactions) {
    if (t.type === 'inflow') {
      periodOpeningBalance += t.amount;
    } else {
      periodOpeningBalance -= t.amount;
    }
  }

  // Calculate period totals
  let totalInflow = 0;
  let totalOutflow = 0;
  let cashInflowTotal = 0;
  let bankInflowTotal = 0;
  let mobileInflowTotal = 0;
  let cashOutflowTotal = 0;
  let bankOutflowTotal = 0;

  for (const t of periodTransactions) {
    if (t.type === 'inflow') {
      totalInflow += t.amount;
      if (t.paymentMethod === 'cash') cashInflowTotal += t.amount;
      else if (t.paymentMethod === 'bank') bankInflowTotal += t.amount;
      else mobileInflowTotal += t.amount;
    } else {
      totalOutflow += t.amount;
      if (t.paymentMethod === 'cash') cashOutflowTotal += t.amount;
      else bankOutflowTotal += t.amount;
    }
  }

  const netCashFlow = totalInflow - totalOutflow;
  const periodClosingBalance = periodOpeningBalance + netCashFlow;

  const summary: CashPeriodSummary = {
    periodOpeningBalance,
    totalInflow,
    totalOutflow,
    netCashFlow,
    periodClosingBalance,
    transactionsCount: periodTransactions.length,
    inflowCount: periodTransactions.filter((t) => t.type === 'inflow').length,
    outflowCount: periodTransactions.filter((t) => t.type === 'outflow').length,
    cashInflowTotal,
    bankInflowTotal,
    mobileInflowTotal,
    cashOutflowTotal,
    bankOutflowTotal,
  };

  return {
    filteredTransactions: periodTransactions,
    summary,
  };
}

/**
 * Exports transactions array as a downloadable CSV spreadsheet
 */
export function exportCashBookCSV(
  transactions: UnifiedCashTransaction[],
  fileName: string = 'cash_book_statement.csv'
) {
  const headers = [
    'ক্রমিক',
    'তারিখ',
    'মাস',
    'বছর',
    'ধরন',
    'ক্যাটাগরি',
    'বিবরণ',
    'উৎস/প্রাপক',
    'ভাউচার/রশিদ রেফারেন্স',
    'পেমেন্ট মাধ্যম',
    'জমা (Inflow ৳)',
    'খরচ (Outflow ৳)',
    'অবশিষ্ট স্থিতি (Balance ৳)',
    'রেকর্ডকারী',
  ];

  const rows = transactions.map((t, idx) => [
    idx + 1,
    `"${t.date}"`,
    `"${t.month}"`,
    t.year,
    t.type === 'inflow' ? 'জমা (Inflow)' : 'খরচ (Outflow)',
    `"${t.category}"`,
    `"${t.description.replace(/"/g, '""')}"`,
    `"${t.sourceOrPayee.replace(/"/g, '""')}"`,
    `"${t.referenceNo}"`,
    `"${t.paymentMethod}"`,
    t.type === 'inflow' ? t.amount : 0,
    t.type === 'outflow' ? t.amount : 0,
    t.runningBalance,
    `"${t.recordedBy || ''}"`,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
