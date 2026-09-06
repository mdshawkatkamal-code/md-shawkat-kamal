import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  MONTHS,
  MONTHS_BN,
  formatDateBn,
  toBengaliNumber,
} from '../../utils/formatters';
import { compileCashTransactions, getPeriodCashSummary } from '../../utils/cashBookHelper';
import { openPrintWindow, PrintDocumentData } from '../../utils/printReportHelper';
import {
  Printer,
  X,
  ExternalLink,
  CheckCircle2,
  FileText,
  Calendar,
  Building2,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

export type ReportType =
  | 'profit_loss'
  | 'income'
  | 'expense'
  | 'due'
  | 'tenant_statement'
  | 'cashbook_statement'
  | 'yearly';

interface ReportPrintPreviewModalProps {
  initialReportType: ReportType;
  initialMonth?: string;
  initialYear?: number;
  onClose: () => void;
}

export const ReportPrintPreviewModal: React.FC<ReportPrintPreviewModalProps> = ({
  initialReportType,
  initialMonth,
  initialYear,
  onClose,
}) => {
  const {
    bills,
    payments,
    expenses,
    cashBookEntries,
    settings,
    currentUser,
    tenants,
    flats,
    shops,
    selectedMonth: globalMonth,
    selectedYear: globalYear,
  } = useApp();

  const [activeReport, setActiveReport] = useState<ReportType>(initialReportType);
  const [currentMonth, setCurrentMonth] = useState<string>(initialMonth || globalMonth);
  const [currentYear, setCurrentYear] = useState<number>(initialYear || globalYear);
  const [showSignatures, setShowSignatures] = useState<boolean>(true);
  const [showMetrics, setShowMetrics] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string>('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Calculations for current selected Month & Year
  const monthPayments = payments.filter((p) => p.month === currentMonth && p.year === currentYear);
  const totalIncome = monthPayments.reduce((acc, p) => acc + p.amount, 0);

  const monthExpenses = expenses.filter((e) => e.month === currentMonth && e.year === currentYear);
  const totalExpense = monthExpenses.reduce((acc, e) => acc + e.amount, 0);

  const monthBills = bills.filter((b) => b.month === currentMonth && b.year === currentYear);
  const totalBilled = monthBills.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalDue = monthBills.reduce((acc, b) => acc + b.dueAmount, 0);

  const netProfit = totalIncome - totalExpense;
  const isProfitable = netProfit >= 0;

  // Due tenants list
  const dueTenantsList = tenants
    .map((tenant) => {
      const tBills = bills.filter((b) => b.tenantId === tenant.id);
      const totalB = tBills.reduce((acc, b) => acc + b.totalAmount, 0);
      const totalP = tBills.reduce((acc, b) => acc + b.paidAmount, 0);
      const due = Math.max(0, totalB - totalP);
      return { tenant, totalB, totalP, due };
    })
    .filter((t) => t.due > 0)
    .sort((a, b) => b.due - a.due);

  // Yearly data
  const yearlyMonthsData = MONTHS.map((m) => {
    const inc = payments
      .filter((p) => p.month === m && p.year === currentYear)
      .reduce((acc, p) => acc + p.amount, 0);
    const exp = expenses
      .filter((e) => e.month === m && e.year === currentYear)
      .reduce((acc, e) => acc + e.amount, 0);
    const prof = inc - exp;
    return {
      month: MONTHS_BN[m] || m,
      monthEn: m,
      income: inc,
      expense: exp,
      profit: prof,
    };
  });
  const yearlyTotalIncome = yearlyMonthsData.reduce((acc, d) => acc + d.income, 0);
  const yearlyTotalExpense = yearlyMonthsData.reduce((acc, d) => acc + d.expense, 0);
  const yearlyNetProfit = yearlyTotalIncome - yearlyTotalExpense;

  // Cash book data
  const allCashTx = compileCashTransactions(
    payments,
    expenses,
    cashBookEntries,
    settings.openingCashBalance || 250000
  );
  const { filteredTransactions: cashTxList, summary: cashSummary } = getPeriodCashSummary(allCashTx, {
    month: currentMonth,
    year: currentYear,
    baseOpeningBalance: settings.openingCashBalance || 250000,
  });

  // Current Date string in Bengali
  const todayStr = formatDateBn(new Date().toISOString().split('T')[0]);
  const referenceCode = `RPT-${currentYear}-${currentMonth.slice(0, 3).toUpperCase()}-${activeReport.slice(0, 3).toUpperCase()}`;

  // Build document metadata for standalone print window
  const getDocumentData = (): PrintDocumentData => {
    const propName = settings.propertyNameBn || settings.propertyName;
    const propAddr = settings.addressBn || settings.address;
    const propPhone = settings.phone || '01711-234567';
    const propEmail = settings.email || 'info@tultulvilla.com';

    switch (activeReport) {
      case 'profit_loss': {
        const catMap: Record<string, number> = {};
        monthExpenses.forEach((e) => {
          catMap[e.category] = (catMap[e.category] || 0) + e.amount;
        });
        const catRows = Object.entries(catMap).map(([cat, amt], idx) => [
          toBengaliNumber(idx + 1),
          `ব্যয় খাত: ${cat}`,
          'পরিচালন ও রক্ষণাবেক্ষণ খরচ',
          `-${formatCurrency(amt)}`,
        ]);

        return {
          title: `লাভ ও ক্ষতি বিবরণী (Profit & Loss Statement)`,
          subtitle: `সময়কাল: ${MONTHS_BN[currentMonth]} ${toBengaliNumber(currentYear)}`,
          propertyName: propName,
          propertyAddress: propAddr,
          propertyPhone: propPhone,
          propertyEmail: propEmail,
          reportDate: todayStr,
          referenceNo: referenceCode,
          preparedBy: currentUser.name,
          showSignatures,
          summaryMetrics: [
            { label: 'মোট সংগৃহীত আয় (Income)', value: `+${formatCurrency(totalIncome)}`, color: '#14532D' },
            { label: 'মোট পরিচালন ব্যয় (Expense)', value: `-${formatCurrency(totalExpense)}`, color: '#801414' },
            { label: 'নিট লাভ / মুনাফা (Net Profit)', value: formatCurrency(netProfit), color: isProfitable ? '#14532D' : '#801414' },
          ],
          tableHeaders: ['ক্র.', 'হিসাব বিবরণী ও খাত', 'খাতের বিবরণ', 'টাকার পরিমাণ (৳)'],
          tableAlignments: ['center', 'left', 'left', 'right'],
          tableRows: [
            ['১', 'মাসিক বাড়ি ভাড়া ও ইউটিলিটি চার্জ আদায়', 'সকল ফ্ল্যাট ও দোকানের সংগৃহীত মোট আয়', `+${formatCurrency(totalIncome)}`],
            ...catRows,
          ],
          totalRow: ['সর্বমোট ফলাফল', `${isProfitable ? 'নিট লাভ (PROFIT)' : 'নিট লোকসান (LOSS)'}`, `আয় থেকে মোট ব্যয় বাদ দিয়ে`, formatCurrency(netProfit)],
          notes: 'উক্ত হিসাব তুলতুল ভিলার অফিশিয়াল রেজিস্টার অনুযায়ী প্রস্তুত ও যাচাইকৃত।',
        };
      }

      case 'income': {
        return {
          title: `মাসিক মোট আয় বিবরণী (Monthly Income Report)`,
          subtitle: `সময়কাল: ${MONTHS_BN[currentMonth]} ${toBengaliNumber(currentYear)} (মোট আদায়: ${toBengaliNumber(monthPayments.length)}টি)`,
          propertyName: propName,
          propertyAddress: propAddr,
          propertyPhone: propPhone,
          propertyEmail: propEmail,
          reportDate: todayStr,
          referenceNo: referenceCode,
          preparedBy: currentUser.name,
          showSignatures,
          summaryMetrics: [
            { label: 'মোট আদায়কৃত আয়', value: formatCurrency(totalIncome), color: '#14532D' },
            { label: 'আদায়ের সংখ্যা', value: `${toBengaliNumber(monthPayments.length)} টি`, color: '#141414' },
            { label: 'চলতি মাসের মোট বিল', value: formatCurrency(totalBilled), color: '#141414' },
          ],
          tableHeaders: ['ক্র.', 'রিসিট নং ও তারিখ', 'ভাড়াটিয়ার নাম ও মোবাইল', 'বরাদ্দ ইউনিট', 'মাধ্যম', 'আদায়কৃত টাকা (৳)'],
          tableAlignments: ['center', 'left', 'left', 'center', 'center', 'right'],
          tableRows: monthPayments.map((p, idx) => [
            toBengaliNumber(idx + 1),
            `${p.receiptNumber}\n(${p.paymentDate})`,
            p.tenantName,
            p.unitNumber,
            p.paymentMethod.toUpperCase(),
            formatCurrency(p.amount),
          ]),
          totalRow: ['মোট', `সর্বমোট আদায় (${toBengaliNumber(monthPayments.length)}টি রিসিট)`, '', '', '', formatCurrency(totalIncome)],
        };
      }

      case 'expense': {
        return {
          title: `মাসিক মোট পরিচালন ব্যয় বিবরণী (Monthly Expense Report)`,
          subtitle: `সময়কাল: ${MONTHS_BN[currentMonth]} ${toBengaliNumber(currentYear)} (মোট খরচ এন্ট্রি: ${toBengaliNumber(monthExpenses.length)}টি)`,
          propertyName: propName,
          propertyAddress: propAddr,
          propertyPhone: propPhone,
          propertyEmail: propEmail,
          reportDate: todayStr,
          referenceNo: referenceCode,
          preparedBy: currentUser.name,
          showSignatures,
          summaryMetrics: [
            { label: 'মোট পরিচালন ব্যয়', value: formatCurrency(totalExpense), color: '#801414' },
            { label: 'ব্যয় ভাউচার সংখ্যা', value: `${toBengaliNumber(monthExpenses.length)} টি`, color: '#141414' },
          ],
          tableHeaders: ['ক্র.', 'ভাউচার নং ও তারিখ', 'খরচের খাত / ক্যাটাগরি', 'প্রাপক ব্যক্তি / প্রতিষ্ঠান', 'বিবরণ', 'টাকার পরিমাণ (৳)'],
          tableAlignments: ['center', 'left', 'center', 'left', 'left', 'right'],
          tableRows: monthExpenses.map((e, idx) => [
            toBengaliNumber(idx + 1),
            `${e.voucherNumber || (e as any).expenseNumber || `EXP-${e.id}`}\n(${e.date})`,
            e.category,
            e.paidTo,
            e.description || '-',
            formatCurrency(e.amount),
          ]),
          totalRow: ['মোট', `সর্বমোট পরিচালন ব্যয় (${toBengaliNumber(monthExpenses.length)}টি ভাউচার)`, '', '', '', formatCurrency(totalExpense)],
        };
      }

      case 'due': {
        const sumDue = dueTenantsList.reduce((acc, t) => acc + t.due, 0);
        return {
          title: `বকেয়া ভাড়া ও অনাদায় তালিকা (Due & Arrears Report)`,
          subtitle: `সর্বমোট বকেয়াদার সংখ্যা: ${toBengaliNumber(dueTenantsList.length)} জন ভাড়াটিয়া`,
          propertyName: propName,
          propertyAddress: propAddr,
          propertyPhone: propPhone,
          propertyEmail: propEmail,
          reportDate: todayStr,
          referenceNo: referenceCode,
          preparedBy: currentUser.name,
          showSignatures,
          summaryMetrics: [
            { label: 'সর্বমোট অপরিশোধিত বকেয়া', value: formatCurrency(sumDue), color: '#801414' },
            { label: 'বকেয়াদার ভাড়াটিয়া সংখ্যা', value: `${toBengaliNumber(dueTenantsList.length)} জন`, color: '#801414' },
          ],
          tableHeaders: ['ক্র.', 'ভাড়াটিয়ার নাম ও মোবাইল', 'ইউনিট', 'চুক্তিভিত্তিক মাসিক ভাড়া', 'মোট ধার্যকৃত বিল', 'পরিশোধ', 'বকেয়া পাওনা (৳)'],
          tableAlignments: ['center', 'left', 'center', 'right', 'right', 'right', 'right'],
          tableRows: dueTenantsList.map(({ tenant, totalB, totalP, due }, idx) => [
            toBengaliNumber(idx + 1),
            `${tenant.name}\n(${tenant.phone})`,
            `${tenant.unitNumber} (${tenant.unitType.toUpperCase()})`,
            formatCurrency(tenant.monthlyRent),
            formatCurrency(totalB),
            formatCurrency(totalP),
            formatCurrency(due),
          ]),
          totalRow: ['মোট', `সর্বমোট বকেয়া পাওনা (${toBengaliNumber(dueTenantsList.length)} জন)`, '', '', '', '', formatCurrency(sumDue)],
        };
      }

      case 'cashbook_statement': {
        return {
          title: `দৈনিক ক্যাশ বুক অডিট স্টেটমেন্ট (Cash Book Statement)`,
          subtitle: `সময়কাল: ${MONTHS_BN[currentMonth]} ${toBengaliNumber(currentYear)}`,
          propertyName: propName,
          propertyAddress: propAddr,
          propertyPhone: propPhone,
          propertyEmail: propEmail,
          reportDate: todayStr,
          referenceNo: referenceCode,
          preparedBy: currentUser.name,
          showSignatures,
          summaryMetrics: [
            { label: 'প্রারম্ভিক নগদ স্থিতি', value: formatCurrency(cashSummary.periodOpeningBalance), color: '#141414' },
            { label: 'মোট নগদ জমা (+)', value: `+${formatCurrency(cashSummary.totalInflow)}`, color: '#14532D' },
            { label: 'মোট নগদ খরচ (-)', value: `-${formatCurrency(cashSummary.totalOutflow)}`, color: '#801414' },
            { label: 'সমাপনী নগদ ব্যালেন্স', value: formatCurrency(cashSummary.periodClosingBalance), color: '#141414' },
          ],
          tableHeaders: ['ক্র.', 'তারিখ', 'বিবরণ ও উৎস/প্রাপক', 'রেফারেন্স নং', 'মাধ্যম', 'জমা / Inflow (৳)', 'খরচ / Outflow (৳)', 'ব্যালেন্স (৳)'],
          tableAlignments: ['center', 'center', 'left', 'center', 'center', 'right', 'right', 'right'],
          tableRows: [
            ['--', `০১ ${MONTHS_BN[currentMonth]}`, 'প্রারম্ভিক নগদ স্থিতি (Opening Balance B/F)', '-', 'নগদ', '---', '---', formatCurrency(cashSummary.periodOpeningBalance)],
            ...cashTxList.map((t, idx) => [
              toBengaliNumber(idx + 1),
              t.date,
              `${t.description} [${t.category} - ${t.sourceOrPayee}]`,
              t.referenceNo,
              t.paymentMethod === 'cash' ? 'নগদ' : t.paymentMethod === 'bank' ? 'ব্যাংক' : 'মোবাইল',
              t.type === 'inflow' ? `+${formatCurrency(t.amount)}` : '---',
              t.type === 'outflow' ? `-${formatCurrency(t.amount)}` : '---',
              formatCurrency(t.runningBalance),
            ]),
          ],
          totalRow: ['মোট', `মোট লেনদেন (${toBengaliNumber(cashTxList.length)}টি)`, '', '', '', `+${formatCurrency(cashSummary.totalInflow)}`, `-${formatCurrency(cashSummary.totalOutflow)}`, formatCurrency(cashSummary.periodClosingBalance)],
        };
      }

      case 'yearly': {
        return {
          title: `বাৎসরিক আয়, ব্যয় ও লাভ-ক্ষতি বিবরণী (Annual Financial Report)`,
          subtitle: `অর্থবছর: ${toBengaliNumber(currentYear)} সাল (১২ মাসের সম্পূর্ণ হিসাব)`,
          propertyName: propName,
          propertyAddress: propAddr,
          propertyPhone: propPhone,
          propertyEmail: propEmail,
          reportDate: todayStr,
          referenceNo: referenceCode,
          preparedBy: currentUser.name,
          showSignatures,
          summaryMetrics: [
            { label: `${toBengaliNumber(currentYear)} সালের মোট আয়`, value: formatCurrency(yearlyTotalIncome), color: '#14532D' },
            { label: `${toBengaliNumber(currentYear)} সালের মোট ব্যয়`, value: formatCurrency(yearlyTotalExpense), color: '#801414' },
            { label: `বাৎসরিক নিট মুনাফা (Net Profit)`, value: formatCurrency(yearlyNetProfit), color: yearlyNetProfit >= 0 ? '#14532D' : '#801414' },
          ],
          tableHeaders: ['ক্র.', 'মাসের নাম', 'মোট সংগৃহীত আয় (৳)', 'মোট পরিচালন ব্যয় (৳)', 'মাসিক লাভ / ক্ষতি (৳)', 'স্থিতি'],
          tableAlignments: ['center', 'left', 'right', 'right', 'right', 'center'],
          tableRows: yearlyMonthsData.map((d, idx) => [
            toBengaliNumber(idx + 1),
            `${d.month} (${d.monthEn})`,
            formatCurrency(d.income),
            formatCurrency(d.expense),
            formatCurrency(d.profit),
            d.profit >= 0 ? 'লাভ' : 'লোকসান',
          ]),
          totalRow: ['মোট', `${toBengaliNumber(currentYear)} সালের বাৎসরিক মোট`, formatCurrency(yearlyTotalIncome), formatCurrency(yearlyTotalExpense), formatCurrency(yearlyNetProfit), yearlyNetProfit >= 0 ? 'লাভজনক' : 'লোকসান'],
        };
      }

      case 'tenant_statement':
      default: {
        const rows = tenants.map((t, idx) => {
          const bill = bills.find((b) => b.tenantId === t.id && b.month === currentMonth && b.year === currentYear);
          const bTotal = bill ? bill.totalAmount : t.monthlyRent;
          const bPaid = bill ? bill.paidAmount : 0;
          const bDue = bill ? bill.dueAmount : t.monthlyRent;
          return [
            toBengaliNumber(idx + 1),
            `${t.name}\n(${t.phone})`,
            `${t.unitNumber} (${t.unitType.toUpperCase()})`,
            formatCurrency(bTotal),
            formatCurrency(bPaid),
            formatCurrency(bDue),
          ];
        });

        const totalB = rows.reduce((acc, r) => acc + (typeof r[3] === 'string' ? 0 : 0), 0);

        return {
          title: `ভাড়াটিয়া স্টেটমেন্ট ও হিসাব অডিট সারসংক্ষেপ (Tenants Audit Summary)`,
          subtitle: `সময়কাল: ${MONTHS_BN[currentMonth]} ${toBengaliNumber(currentYear)}`,
          propertyName: propName,
          propertyAddress: propAddr,
          propertyPhone: propPhone,
          propertyEmail: propEmail,
          reportDate: todayStr,
          referenceNo: referenceCode,
          preparedBy: currentUser.name,
          showSignatures,
          summaryMetrics: [
            { label: 'মোট সক্রিয় ভাড়াটিয়া', value: `${toBengaliNumber(tenants.length)} জন`, color: '#141414' },
            { label: 'বর্তমান মাসের মোট বিল', value: formatCurrency(totalBilled), color: '#141414' },
            { label: 'মোট পরিশোধ', value: formatCurrency(totalIncome), color: '#14532D' },
            { label: 'মোট বকেয়া', value: formatCurrency(totalDue), color: '#801414' },
          ],
          tableHeaders: ['ক্র.', 'ভাড়াটিয়ার নাম ও মোবাইল', 'বরাদ্দ ইউনিট', 'ধার্যকৃত মোট বিল (৳)', 'পরিশোধিত টাকা (৳)', 'বকেয়া স্থিতি (৳)'],
          tableAlignments: ['center', 'left', 'center', 'right', 'right', 'right'],
          tableRows: rows,
          totalRow: ['মোট', `সর্বমোট ভাড়াটিয়া (${toBengaliNumber(tenants.length)} জন)`, '', formatCurrency(totalBilled), formatCurrency(totalIncome), formatCurrency(totalDue)],
        };
      }
    }
  };

  const doc = getDocumentData();

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error(e);
      // If window.print fails due to iframe sandbox, immediately offer open in tab
      handleOpenPrintWindow();
    }
  };

  const handleOpenPrintWindow = () => {
    const success = openPrintWindow(doc);
    if (!success) {
      setFeedback('পপ-আপ ব্লক করা হয়েছে। অনুগ্রহ করে ব্রাউজারের পপ-আপ অনুমতি দিন অথবা সরাসরি প্রিন্ট করুন।');
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#141414]/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-[#F4F3F0] max-w-5xl w-full border-2 border-[#141414] shadow-2xl my-3 sm:my-6 flex flex-col max-h-[96vh] rounded-none">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-3 sm:px-5 bg-[#DDDCD7] border-b border-[#141414] no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#144A29]" />
            <div>
              <h3 className="text-sm font-bold text-[#141414] font-mono-data">
                রিপোর্ট প্রিন্ট প্রিভিউ ও প্রিন্ট অপশন (Report Print Preview)
              </h3>
              <p className="text-[11px] text-[#141414]/70">
                A4 সাইজ ফরম্যাটেড অফিশিয়াল রিপোর্ট এবং ব্রাউজার প্রিন্ট / PDF সংরক্ষণ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono-data text-xs">
            {/* Direct Window Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#144A29] hover:bg-[#0E351D] text-[#E4E3E0] font-bold border border-[#141414] cursor-pointer shadow-xs transition-colors"
              title="ব্রাউজার প্রিন্ট ডায়ালগ খুলুন"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন (Print / PDF)</span>
            </button>

            {/* Open in Standalone Print Window (100% reliable inside iframe) */}
            <button
              onClick={handleOpenPrintWindow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#2A2A28] text-[#E4E3E0] font-bold border border-[#141414] cursor-pointer shadow-xs transition-colors"
              title="আইফ্রেম ব্লকিং এড়াতে আলাদা ট্যাবে বা উইন্ডোতে সরাসরি প্রিন্ট করুন"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>আলাদা ট্যাবে প্রিন্ট</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-[#141414] hover:bg-[#C8C7C2] border border-transparent hover:border-[#141414]/40 cursor-pointer transition-colors ml-1"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Toolbar inside Preview (Hidden on print) */}
        <div className="p-2.5 sm:px-5 bg-[#EBEAE6] border-b border-[#141414]/30 no-print flex flex-wrap items-center justify-between gap-2.5 font-mono-data text-xs">
          {/* Select Report to Preview */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#141414]/70">রিপোর্ট:</span>
            <select
              aria-label="প্রিভিউ রিপোর্ট টাইপ নির্বাচন"
              value={activeReport}
              onChange={(e) => setActiveReport(e.target.value as ReportType)}
              className="bg-[#F4F3F0] font-bold border border-[#141414]/40 px-2 py-1 outline-none cursor-pointer"
            >
              <option value="profit_loss">লাভ-ক্ষতি বিবরণী (Profit &amp; Loss)</option>
              <option value="income">মাসিক মোট আয় (Monthly Income)</option>
              <option value="expense">মাসিক মোট ব্যয় (Monthly Expense)</option>
              <option value="due">বকেয়া রিপোর্ট (Due Report)</option>
              <option value="tenant_statement">ভাড়াটিয়া স্টেটমেন্ট সারসংক্ষেপ</option>
              <option value="cashbook_statement">ক্যাশ বুক অডিট বিবরণী</option>
              <option value="yearly">বাৎসরিক আর্থিক বিবরণী ({currentYear})</option>
            </select>
          </div>

          {/* Month & Year Selectors */}
          <div className="flex items-center gap-1.5 bg-[#F4F3F0] px-2 py-1 border border-[#141414]/30">
            <Calendar className="w-3.5 h-3.5 text-[#141414]/60" />
            <select
              aria-label="রিপোর্ট মাস"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="bg-transparent font-bold text-[#141414] outline-none cursor-pointer"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {MONTHS_BN[m]}
                </option>
              ))}
            </select>
            <select
              aria-label="রিপোর্ট বছর"
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="bg-transparent font-bold text-[#141414] outline-none cursor-pointer"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          {/* Print Option Checkboxes */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-[#141414]">
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={(e) => setShowSignatures(e.target.checked)}
                className="cursor-pointer accent-[#141414]"
              />
              <span>অফিসিয়াল স্বাক্ষর দেখান</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-[#141414]">
              <input
                type="checkbox"
                checked={showMetrics}
                onChange={(e) => setShowMetrics(e.target.checked)}
                className="cursor-pointer accent-[#141414]"
              />
              <span>সারাংশ কার্ড দেখান</span>
            </label>
          </div>
        </div>

        {/* Info Banner for print preview user experience (Hidden on print) */}
        <div className="bg-[#EBF3ED] px-4 py-1.5 border-b border-[#144A29]/20 text-[11px] text-[#144A29] flex items-center justify-between no-print">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>প্রিন্ট টিপস:</strong> ব্রাউজারের প্রিন্ট উইন্ডোতে Destination অপশন থেকে <strong>"Save as PDF"</strong> সিলেক্ট করে এই রিপোর্টটি সরাসরি PDF হিসেবে আপনার কম্পিউটারে বা মোবাইলে সেভ করতে পারেন। আইফ্রেম বা প্রিভিউতে প্রিন্ট ডায়ালগ না আসলে <strong>"আলাদা ট্যাবে প্রিন্ট"</strong> বাটনে ক্লিক করুন।
            </span>
          </div>
          {feedback && <span className="font-bold text-[#801414] shrink-0 ml-2">{feedback}</span>}
        </div>

        {/* Interactive A4 Document Preview Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#C8C7C2]/40 flex justify-center">
          
          {/* A4 Paper Container */}
          <div
            id="printable-report-modal"
            className="printable-content bg-white text-[#141414] border border-[#141414] shadow-xl w-full max-w-[820px] p-6 sm:p-10 font-sans my-auto min-h-[700px] flex flex-col justify-between"
          >
            <div>
              {/* Header Letterhead */}
              <div className="text-center pb-4 border-b-2 border-[#141414] mb-4">
                <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold text-[#141414] tracking-tight">
                  {doc.propertyName}
                </h1>
                <p className="text-xs text-[#141414]/80 mt-1 font-mono-data">{doc.propertyAddress}</p>
                {(doc.propertyPhone || doc.propertyEmail) && (
                  <p className="text-[11px] text-[#141414]/60 font-mono-data mt-0.5">
                    যোগাযোগ: {doc.propertyPhone} {doc.propertyEmail ? `• ${doc.propertyEmail}` : ''}
                  </p>
                )}

                <div className="inline-block mt-3 px-4 py-1 bg-[#141414] text-white text-xs font-bold font-mono-data tracking-wide uppercase shadow-2xs">
                  {doc.title}
                </div>
                {doc.subtitle && (
                  <p className="text-xs font-bold text-[#141414]/80 mt-1 font-mono-data">
                    {doc.subtitle}
                  </p>
                )}
              </div>

              {/* Reference & Metadata Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#F4F3F0] border border-[#141414] mb-4 text-[11px] font-mono-data">
                <div>
                  <span className="text-[#141414]/60 font-bold">রিপোর্ট রেফারেন্স:</span>{' '}
                  <span className="font-bold text-[#141414]">{doc.referenceNo}</span>
                </div>
                <div>
                  <span className="text-[#141414]/60 font-bold">প্রস্তুতির তারিখ:</span>{' '}
                  <span className="font-bold text-[#141414]">{doc.reportDate}</span>
                </div>
                <div>
                  <span className="text-[#141414]/60 font-bold">প্রস্তুতকারী:</span>{' '}
                  <span className="font-bold text-[#141414]">{doc.preparedBy}</span>
                </div>
              </div>

              {/* Summary Cards */}
              {showMetrics && doc.summaryMetrics && doc.summaryMetrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 font-mono-data">
                  {doc.summaryMetrics.map((m, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-[#F9F9F8] border border-[#141414] text-center"
                      style={m.color ? { borderTop: `3px solid ${m.color}` } : undefined}
                    >
                      <span className="text-[10px] uppercase font-bold text-[#141414]/60 block">
                        {m.label}
                      </span>
                      <div
                        className="text-base sm:text-lg font-bold mt-0.5"
                        style={m.color ? { color: m.color } : undefined}
                      >
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Data Table */}
              <div className="overflow-x-auto mb-6">
                <table className="tech-grid-table w-full text-left text-xs font-mono-data border-collapse border border-[#141414]">
                  <thead className="bg-[#EBEAE6] border-b-2 border-[#141414] text-[#141414] font-bold text-[11px] uppercase">
                    <tr>
                      {doc.tableHeaders.map((th, idx) => {
                        const align =
                          (doc.tableAlignments && doc.tableAlignments[idx]) ||
                          (idx === 0 ? 'text-center' : idx === doc.tableHeaders.length - 1 ? 'text-right' : 'text-left');
                        return (
                          <th key={idx} className={`p-2.5 border border-[#141414]/30 ${align}`}>
                            {th}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]/20 text-[#141414]">
                    {doc.tableRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={doc.tableHeaders.length}
                          className="text-center py-8 text-[#141414]/60 italic font-sans"
                        >
                          এই রিপোর্ট সময়ের জন্য কোন ডাটা পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      doc.tableRows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-[#FAFAF9]' : 'bg-white'}>
                          {row.map((cell, cIdx) => {
                            const align =
                              (doc.tableAlignments && doc.tableAlignments[cIdx]) ||
                              (cIdx === 0
                                ? 'text-center'
                                : cIdx === row.length - 1
                                ? 'text-right'
                                : 'text-left');
                            return (
                              <td key={cIdx} className={`p-2 border border-[#141414]/20 ${align} whitespace-pre-line`}>
                                {cell}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}

                    {/* Total Summary Row */}
                    {doc.totalRow && (
                      <tr className="bg-[#EBEAE6] font-bold border-t-2 border-b-2 border-[#141414] text-xs">
                        {doc.totalRow.map((cell, cIdx) => {
                          const align =
                            (doc.tableAlignments && doc.tableAlignments[cIdx]) ||
                            (cIdx === 0
                              ? 'text-left'
                              : cIdx === doc.totalRow!.length - 1
                              ? 'text-right'
                              : 'text-left');
                          return (
                            <td key={cIdx} className={`p-2.5 border border-[#141414]/40 ${align}`}>
                              {cell}
                            </td>
                          );
                        })}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Optional Footer Notes */}
              {doc.notes && (
                <div className="text-[11px] text-[#141414]/70 italic mb-6 font-sans">
                  * {doc.notes}
                </div>
              )}
            </div>

            {/* Official Signatures Verification Footer */}
            {showSignatures && (
              <div className="pt-10 border-t border-[#141414]/20 mt-8">
                <div className="grid grid-cols-3 gap-6 text-center text-xs font-mono-data">
                  <div>
                    <div className="border-t border-[#141414] pt-1.5 font-bold text-[#141414]">
                      প্রস্তুতকারী / হিসাবরক্ষক
                    </div>
                    <span className="text-[10px] text-[#141414]/60 block mt-0.5">স্বাক্ষর ও তারিখ</span>
                  </div>

                  <div>
                    <div className="border-t border-[#141414] pt-1.5 font-bold text-[#141414]">
                      যাচাইকারী / ম্যানেজার
                    </div>
                    <span className="text-[10px] text-[#141414]/60 block mt-0.5">স্বাক্ষর ও তারিখ</span>
                  </div>

                  <div>
                    <div className="border-t border-[#141414] pt-1.5 font-bold text-[#141414]">
                      অনুমোদনকারী (মালিক)
                    </div>
                    <span className="text-[10px] text-[#141414]/60 block mt-0.5">তুলতুল ভিলা, ঢাকা</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Footer (Hidden on print) */}
        <div className="p-3 sm:px-5 bg-[#DDDCD7] border-t border-[#141414] no-print flex flex-wrap items-center justify-between gap-2 font-mono-data text-xs">
          <div className="text-[#141414]/70">
            রিপোর্ট: <strong className="text-[#141414]">{doc.title}</strong> • {MONTHS_BN[currentMonth]} {toBengaliNumber(currentYear)}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#144A29] hover:bg-[#0E351D] text-white font-bold border border-[#141414] cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন (Print Now)</span>
            </button>

            <button
              onClick={handleOpenPrintWindow}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#141414] hover:bg-[#2A2A28] text-[#E4E3E0] font-bold border border-[#141414] cursor-pointer shadow-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>আলাদা উইন্ডোতে প্রিন্ট</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-[#EBEAE6] hover:bg-[#C8C7C2] text-[#141414] font-bold border border-[#141414]/40 cursor-pointer transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
