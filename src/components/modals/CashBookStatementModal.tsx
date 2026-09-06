import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  MONTHS,
  MONTHS_BN,
  formatDateBn,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  compileCashTransactions,
  getPeriodCashSummary,
  exportCashBookCSV,
  UnifiedCashTransaction,
} from '../../utils/cashBookHelper';
import {
  Printer,
  X,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Calendar,
  Filter,
  Search,
  Building2,
  Wallet,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { openPrintWindow } from '../../utils/printReportHelper';

interface CashBookStatementModalProps {
  onClose: () => void;
  defaultMonth?: string;
  defaultYear?: number;
}

export const CashBookStatementModal: React.FC<CashBookStatementModalProps> = ({
  onClose,
  defaultMonth,
  defaultYear,
}) => {
  const {
    payments,
    expenses,
    cashBookEntries,
    settings,
    currentUser,
    selectedMonth: globalMonth,
    selectedYear: globalYear,
  } = useApp();

  const [statementPeriod, setStatementPeriod] = useState<'month' | 'range' | 'all'>('month');
  const [filterMonth, setFilterMonth] = useState(defaultMonth || globalMonth);
  const [filterYear, setFilterYear] = useState(defaultYear || globalYear);
  const [startDate, setStartDate] = useState(
    `${filterYear}-${String(MONTHS.indexOf(filterMonth as any) + 1).padStart(2, '0')}-01`
  );
  const [endDate, setEndDate] = useState(
    `${filterYear}-${String(MONTHS.indexOf(filterMonth as any) + 1).padStart(2, '0')}-28`
  );
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Compile all transactions with continuous running balances
  const allCompiled = compileCashTransactions(
    payments,
    expenses,
    cashBookEntries,
    settings.openingCashBalance || 250000
  );

  // 2. Compute filtered period data & summary
  const { filteredTransactions: periodList, summary } = getPeriodCashSummary(
    allCompiled,
    {
      month: statementPeriod === 'month' ? filterMonth : undefined,
      year: statementPeriod === 'month' ? filterYear : undefined,
      startDate: statementPeriod === 'range' ? startDate : undefined,
      endDate: statementPeriod === 'range' ? endDate : undefined,
      allTime: statementPeriod === 'all',
      baseOpeningBalance: settings.openingCashBalance || 250000,
    }
  );

  // 3. Apply search and type filter for display
  const displayTransactions = periodList.filter((t) => {
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'inflow' && t.type === 'inflow') ||
      (typeFilter === 'outflow' && t.type === 'outflow');

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      t.description.toLowerCase().includes(searchLower) ||
      t.sourceOrPayee.toLowerCase().includes(searchLower) ||
      t.referenceNo.toLowerCase().includes(searchLower) ||
      t.category.toLowerCase().includes(searchLower);

    return matchesType && matchesSearch;
  });

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error(e);
      handleOpenPrintWindow();
    }
  };

  const handleOpenPrintWindow = () => {
    openPrintWindow({
      title: 'দৈনিক ক্যাশ বুক অডিট স্টেটমেন্ট (Cash Book Statement)',
      subtitle: `সময়কাল: ${periodLabel}`,
      propertyName: settings.propertyNameBn || settings.propertyName,
      propertyAddress: settings.addressBn || settings.address,
      propertyPhone: settings.phone,
      propertyEmail: settings.email,
      reportDate: currentDateFormatted,
      referenceNo: `CB-${filterYear}-${statementPeriod.toUpperCase()}`,
      preparedBy: currentUser.name,
      showSignatures: true,
      summaryMetrics: [
        { label: 'প্রারম্ভিক নগদ স্থিতি', value: formatCurrency(summary.periodOpeningBalance), color: '#141414' },
        { label: 'মোট নগদ জমা (+)', value: `+${formatCurrency(summary.totalInflow)}`, color: '#14532D' },
        { label: 'মোট পরিচালন খরচ (-)', value: `-${formatCurrency(summary.totalOutflow)}`, color: '#801414' },
        { label: 'সমাপনী নগদ স্থিতি', value: formatCurrency(summary.periodClosingBalance), color: '#141414' },
      ],
      tableHeaders: ['ক্র.', 'তারিখ', 'বিবরণ ও বিবরণী', 'রেফারেন্স নং', 'মাধ্যম', 'জমা / Inflow', 'খরচ / Outflow', 'ব্যালেন্স (৳)'],
      tableAlignments: ['center', 'center', 'left', 'center', 'center', 'right', 'right', 'right'],
      tableRows: [
        ['--', statementPeriod === 'month' ? `০১ ${MONTHS_BN[filterMonth]}` : startDate, 'প্রারম্ভিক নগদ স্থিতি (Opening Balance B/F)', '-', 'নগদ', '---', '---', formatCurrency(summary.periodOpeningBalance)],
        ...displayTransactions.map((t, idx) => [
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
      totalRow: ['মোট', `মোট লেনদেন (${toBengaliNumber(displayTransactions.length)}টি)`, '', '', '', `+${formatCurrency(summary.totalInflow)}`, `-${formatCurrency(summary.totalOutflow)}`, formatCurrency(summary.periodClosingBalance)],
    });
  };

  const handleExportCSV = () => {
    const periodName =
      statementPeriod === 'month'
        ? `${filterMonth}_${filterYear}`
        : statementPeriod === 'range'
        ? `${startDate}_to_${endDate}`
        : 'All_Time';
    exportCashBookCSV(displayTransactions, `CashBook_Statement_${periodName}.csv`);
  };

  // Period label for report header
  const periodLabel =
    statementPeriod === 'month'
      ? `${MONTHS_BN[filterMonth] || filterMonth} ${toBengaliNumber(filterYear)}`
      : statementPeriod === 'range'
      ? `${formatDateBn(startDate)} থেকে ${formatDateBn(endDate)}`
      : 'সর্বকালের সম্পূর্ণ ক্যাশ বিবরণী (All Time)';

  const currentDateFormatted = formatDateBn(new Date().toISOString().split('T')[0]);

  return (
    <div className="fixed inset-0 z-50 bg-[#141414]/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-[#F4F3F0] max-w-5xl w-full border-2 border-[#141414] shadow-2xl my-4 sm:my-8 flex flex-col max-h-[94vh]">
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between p-3 sm:px-5 border-b border-[#141414] bg-[#DDDCD7] no-print">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#144A29]" />
            <span className="text-xs sm:text-sm font-bold uppercase text-[#141414] tracking-wide font-mono-data">
              ক্যাশ বুক স্টেটমেন্ট ও অডিট রিপোর্ট (Cash Book Statement)
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono-data text-xs">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#144A29] hover:bg-[#0E351D] text-[#E4E3E0] font-bold border border-[#141414] cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>

            <button
              onClick={handleOpenPrintWindow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#2A2A28] text-[#E4E3E0] font-bold border border-[#141414] cursor-pointer shadow-xs transition-colors"
              title="আইফ্রেম ব্লকিং এড়াতে আলাদা ট্যাবে বা উইন্ডোতে সরাসরি প্রিন্ট করুন"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>আলাদা ট্যাবে প্রিন্ট</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBEAE6] hover:bg-[#C8C7C2] text-[#141414] font-bold border border-[#141414]/40 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>এক্সেল (CSV)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#141414] hover:bg-[#C8C7C2] border border-transparent hover:border-[#141414]/40 cursor-pointer transition-colors ml-1"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar (Hidden on Print) */}
        <div className="p-3 sm:px-5 bg-[#EBEAE6] border-b border-[#141414]/30 no-print space-y-2.5 font-mono-data text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Period Mode Selector */}
            <div className="flex items-center gap-1 bg-[#F4F3F0] p-1 border border-[#141414]/30">
              <button
                onClick={() => setStatementPeriod('month')}
                className={`px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                  statementPeriod === 'month'
                    ? 'bg-[#141414] text-white'
                    : 'text-[#141414] hover:bg-[#DDDCD7]'
                }`}
              >
                মাসিক বিবরণী
              </button>
              <button
                onClick={() => setStatementPeriod('range')}
                className={`px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                  statementPeriod === 'range'
                    ? 'bg-[#141414] text-white'
                    : 'text-[#141414] hover:bg-[#DDDCD7]'
                }`}
              >
                তারিখ রেঞ্জ
              </button>
              <button
                onClick={() => setStatementPeriod('all')}
                className={`px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                  statementPeriod === 'all'
                    ? 'bg-[#141414] text-white'
                    : 'text-[#141414] hover:bg-[#DDDCD7]'
                }`}
              >
                সকল রেকর্ড
              </button>
            </div>

            {/* Sub-selectors depending on period mode */}
            {statementPeriod === 'month' && (
              <div className="flex items-center gap-1 bg-[#F4F3F0] px-2 py-1 border border-[#141414]/30">
                <span className="font-bold text-[#141414]/70">মাস:</span>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="font-bold text-[#144A29] bg-transparent outline-none cursor-pointer"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {MONTHS_BN[m]} ({m})
                    </option>
                  ))}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  className="font-bold text-[#141414] bg-transparent outline-none cursor-pointer"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            )}

            {statementPeriod === 'range' && (
              <div className="flex items-center gap-1.5 bg-[#F4F3F0] px-2 py-1 border border-[#141414]/30">
                <span className="font-bold text-[#141414]/70">হতে:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent font-bold text-[#141414] outline-none"
                />
                <span className="font-bold text-[#141414]/70 ml-1">পর্যন্ত:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent font-bold text-[#141414] outline-none"
                />
              </div>
            )}

            {/* Transaction Type Filter */}
            <div className="flex items-center gap-1">
              <select
                aria-label="লেনদেনের ধরন ফিল্টার"
                value={typeFilter}
                onChange={(e: any) => setTypeFilter(e.target.value)}
                className="bg-[#F4F3F0] px-2 py-1 font-bold text-[#141414] border border-[#141414]/30 outline-none cursor-pointer"
              >
                <option value="all">সকল লেনদেন ({periodList.length})</option>
                <option value="inflow">শুধুমাত্র জমা ({summary.inflowCount})</option>
                <option value="outflow">শুধুমাত্র খরচ ({summary.outflowCount})</option>
              </select>
            </div>
          </div>

          {/* Search box */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#141414]/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="বিবরণ, ভাড়াটিয়া নাম, ইউনিট বা রেফারেন্স নং দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-[#F4F3F0] border border-[#141414]/30 outline-none focus:border-[#141414] text-xs"
            />
          </div>
        </div>

        {/* Printable & Scrollable Statement Document */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F4F3F0]">
          <div id="printable-cashbook" className="printable-content space-y-4 text-[#141414]">
            {/* 1. Official Organization Letterhead */}
            <div className="text-center pb-4 border-b-2 border-[#141414]">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Building2 className="w-6 h-6 text-[#144A29]" />
                <h1 className="text-xl sm:text-2xl font-serif-heading font-bold text-[#141414] tracking-tight">
                  {settings.propertyNameBn || settings.propertyName}
                </h1>
              </div>
              <p className="text-xs font-mono-data text-[#141414]/80">
                {settings.addressBn || settings.address}
              </p>
              <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
                মোবাইল: {settings.phone} • ইমেইল: {settings.email}
              </p>

              <div className="mt-3 inline-block px-4 py-1 bg-[#141414] text-[#E4E3E0] font-bold text-xs sm:text-sm font-mono-data tracking-wider uppercase">
                দৈনিক ক্যাশ বুক রেজিস্টার ও আর্থিক বিবরণী (CASH BOOK STATEMENT)
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 text-[11px] font-mono-data text-[#141414]/80 border-t border-[#141414]/20">
                <div>
                  <span className="font-bold text-[#141414]">স্টেটমেন্ট সময়কাল: </span>
                  <span className="bg-[#EBEAE6] px-1.5 py-0.5 font-bold border border-[#141414]/20">
                    {periodLabel}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-[#141414]">প্রস্তুত তারিখ: </span>
                  <span>{currentDateFormatted}</span>
                </div>
                <div>
                  <span className="font-bold text-[#141414]">প্রস্তুতকারী: </span>
                  <span>{currentUser.name}</span>
                </div>
              </div>
            </div>

            {/* 2. Executive Financial Summary Cards (5-Metric Strip) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono-data">
              <div className="bg-[#EBEAE6] p-2.5 border border-[#141414]">
                <span className="text-[10px] font-bold text-[#141414]/70 uppercase block">
                  প্রারম্ভিক স্থিতি (Opening)
                </span>
                <div className="text-base sm:text-lg font-bold text-[#141414] mt-0.5">
                  {formatCurrency(summary.periodOpeningBalance)}
                </div>
                <span className="text-[9px] text-[#141414]/60 block mt-0.5">মাসের শুরুর ক্যাশ</span>
              </div>

              <div className="bg-[#E2EFE7] p-2.5 border border-[#141414]">
                <span className="text-[10px] font-bold text-[#144A29] uppercase flex items-center gap-1">
                  <ArrowDownLeft className="w-3 h-3" />
                  <span>মোট জমা (Inflow)</span>
                </span>
                <div className="text-base sm:text-lg font-bold text-[#144A29] mt-0.5">
                  +{formatCurrency(summary.totalInflow)}
                </div>
                <span className="text-[9px] text-[#144A29] block mt-0.5">
                  {toBengaliNumber(summary.inflowCount)} টি প্রাপ্তি
                </span>
              </div>

              <div className="bg-[#FCE8E8] p-2.5 border border-[#141414]">
                <span className="text-[10px] font-bold text-[#801414] uppercase flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>মোট খরচ (Outflow)</span>
                </span>
                <div className="text-base sm:text-lg font-bold text-[#801414] mt-0.5">
                  -{formatCurrency(summary.totalOutflow)}
                </div>
                <span className="text-[9px] text-[#801414] block mt-0.5">
                  {toBengaliNumber(summary.outflowCount)} টি ব্যয়
                </span>
              </div>

              <div className="bg-[#EBEAE6] p-2.5 border border-[#141414]">
                <span className="text-[10px] font-bold text-[#141414]/70 uppercase block">
                  নিট ক্যাশ ফ্লো (Net)
                </span>
                <div
                  className={`text-base sm:text-lg font-bold mt-0.5 ${
                    summary.netCashFlow >= 0 ? 'text-[#144A29]' : 'text-[#801414]'
                  }`}
                >
                  {summary.netCashFlow >= 0 ? '+' : ''}
                  {formatCurrency(summary.netCashFlow)}
                </div>
                <span className="text-[9px] text-[#141414]/60 block mt-0.5">আয় ও ব্যয়ের পার্থক্য</span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-[#141414] text-[#E4E3E0] p-2.5 border border-[#141414]">
                <span className="text-[10px] font-bold text-[#DDDCD7] uppercase block">
                  সমাপনী স্থিতি (Closing)
                </span>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {formatCurrency(summary.periodClosingBalance)}
                </div>
                <span className="text-[9px] text-[#DDDCD7] block mt-0.5">বর্তমান নগদ উদ্বৃত্ত</span>
              </div>
            </div>

            {/* 3. Detailed Itemized Transaction Ledger Table */}
            <div className="border border-[#141414] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="tech-grid-table w-full text-left text-xs font-mono-data">
                  <thead className="bg-[#DDDCD7] border-b border-[#141414] text-[#141414] font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-2.5 py-2 text-center w-10 border-r border-[#141414]/20">ক্র.</th>
                      <th className="px-2.5 py-2 border-r border-[#141414]/20 whitespace-nowrap">তারিখ</th>
                      <th className="px-2.5 py-2 border-r border-[#141414]/20">বিবরণ ও উৎস/প্রাপক</th>
                      <th className="px-2.5 py-2 border-r border-[#141414]/20 whitespace-nowrap">রেফারেন্স নং</th>
                      <th className="px-2.5 py-2 border-r border-[#141414]/20 text-center whitespace-nowrap">মাধ্যম</th>
                      <th className="px-2.5 py-2 text-right border-r border-[#141414]/20 whitespace-nowrap">
                        জমা / Inflow (৳)
                      </th>
                      <th className="px-2.5 py-2 text-right border-r border-[#141414]/20 whitespace-nowrap">
                        খরচ / Outflow (৳)
                      </th>
                      <th className="px-2.5 py-2 text-right whitespace-nowrap">
                        জের / Balance (৳)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]/15">
                    {/* Opening balance row */}
                    <tr className="bg-[#EBEAE6] font-bold">
                      <td className="px-2.5 py-2 text-center border-r border-[#141414]/20">--</td>
                      <td className="px-2.5 py-2 border-r border-[#141414]/20 whitespace-nowrap">
                        {statementPeriod === 'month' ? `০১ ${MONTHS_BN[filterMonth]} ${filterYear}` : 'প্রারম্ভিক'}
                      </td>
                      <td colSpan={3} className="px-2.5 py-2 border-r border-[#141414]/20">
                        <span>পূর্ববর্তী প্রারম্ভিক নগদ স্থিতি (Opening Balance B/F)</span>
                      </td>
                      <td className="px-2.5 py-2 text-right border-r border-[#141414]/20 text-[#141414]/50">
                        ---
                      </td>
                      <td className="px-2.5 py-2 text-right border-r border-[#141414]/20 text-[#141414]/50">
                        ---
                      </td>
                      <td className="px-2.5 py-2 text-right font-bold text-[#141414]">
                        {formatCurrency(summary.periodOpeningBalance)}
                      </td>
                    </tr>

                    {displayTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-[#141414]/50 font-sans">
                          এই নির্ধারিত সময়কালের জন্য কোন ক্যাশ লেনদেন পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      displayTransactions.map((t, index) => {
                        const isInflow = t.type === 'inflow';
                        const methodLabel =
                          t.paymentMethod === 'cash'
                            ? 'নগদ'
                            : t.paymentMethod === 'bank'
                            ? 'ব্যাংক'
                            : t.paymentMethod === 'mobile_banking'
                            ? 'বিকাশ/নগদ'
                            : t.paymentMethod;

                        return (
                          <tr key={t.id} className="hover:bg-[#EBEAE6]/60 transition-colors">
                            <td className="px-2.5 py-2 text-center text-[#141414]/70 border-r border-[#141414]/20">
                              {toBengaliNumber(index + 1)}
                            </td>
                            <td className="px-2.5 py-2 whitespace-nowrap border-r border-[#141414]/20 font-semibold">
                              {t.date}
                            </td>
                            <td className="px-2.5 py-2 border-r border-[#141414]/20 font-sans">
                              <div className="font-bold text-[#141414] leading-tight">
                                {t.description}
                              </div>
                              <div className="text-[10px] text-[#141414]/60 font-mono-data mt-0.5">
                                ক্যাটাগরি: {t.category} {t.sourceOrPayee ? `• ${t.sourceOrPayee}` : ''}
                              </div>
                            </td>
                            <td className="px-2.5 py-2 border-r border-[#141414]/20 text-[11px] whitespace-nowrap text-[#141414]/80">
                              {t.referenceNo}
                            </td>
                            <td className="px-2.5 py-2 border-r border-[#141414]/20 text-center text-[10px]">
                              <span className="px-1.5 py-0.5 bg-[#EBEAE6] border border-[#141414]/20 font-semibold">
                                {methodLabel}
                              </span>
                            </td>
                            <td className="px-2.5 py-2 text-right border-r border-[#141414]/20 font-bold text-[#144A29]">
                              {isInflow ? `+${formatCurrency(t.amount)}` : '---'}
                            </td>
                            <td className="px-2.5 py-2 text-right border-r border-[#141414]/20 font-bold text-[#801414]">
                              {!isInflow ? `-${formatCurrency(t.amount)}` : '---'}
                            </td>
                            <td className="px-2.5 py-2 text-right font-bold text-[#141414]">
                              {formatCurrency(t.runningBalance)}
                            </td>
                          </tr>
                        );
                      })
                    )}

                    {/* Total Summary Row */}
                    <tr className="bg-[#DDDCD7] border-t-2 border-[#141414] font-bold text-xs">
                      <td colSpan={5} className="px-3 py-2.5 text-right uppercase tracking-wider border-r border-[#141414]/30">
                        সর্বমোট যোগফল (Period Totals):
                      </td>
                      <td className="px-2.5 py-2.5 text-right text-[#144A29] border-r border-[#141414]/30">
                        +{formatCurrency(summary.totalInflow)}
                      </td>
                      <td className="px-2.5 py-2.5 text-right text-[#801414] border-r border-[#141414]/30">
                        -{formatCurrency(summary.totalOutflow)}
                      </td>
                      <td className="px-2.5 py-2.5 text-right text-[#141414] bg-[#C8C7C2]">
                        {formatCurrency(summary.periodClosingBalance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Payment Methods Summary Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-data bg-[#EBEAE6] p-3 border border-[#141414]">
              <div>
                <h4 className="font-bold text-[#141414] border-b border-[#141414]/20 pb-1 mb-1.5 flex items-center gap-1.5">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-[#144A29]" />
                  <span>জমা আদায় মাধ্যম বিভাজন (Inflow by Method)</span>
                </h4>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#141414]/70">নগদ ক্যাশ আদায় (Cash):</span>
                    <span className="font-bold">{formatCurrency(summary.cashInflowTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#141414]/70">ব্যাংক ট্রান্সফার/চেক (Bank):</span>
                    <span className="font-bold">{formatCurrency(summary.bankInflowTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#141414]/70">মোবাইল ব্যাংকিং (bKash/Nagad):</span>
                    <span className="font-bold">{formatCurrency(summary.mobileInflowTotal)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#141414] border-b border-[#141414]/20 pb-1 mb-1.5 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#801414]" />
                  <span>ব্যয় পরিশোধ মাধ্যম বিভাজন (Outflow by Method)</span>
                </h4>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#141414]/70">নগদ পরিশোধ (Cash Expenses):</span>
                    <span className="font-bold">{formatCurrency(summary.cashOutflowTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#141414]/70">ব্যাংক চেক/অনলাইন (Bank Outflow):</span>
                    <span className="font-bold">{formatCurrency(summary.bankOutflowTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#141414]/70">মোট সমাপ্ত ব্যালেন্স (Closing Cash In Hand):</span>
                    <span className="font-bold text-[#141414]">{formatCurrency(summary.periodClosingBalance)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Official Verification & Signatures Strip for Print */}
            <div className="pt-8 pb-4">
              <div className="grid grid-cols-3 gap-6 text-center text-xs font-mono-data">
                <div>
                  <div className="border-t border-[#141414] pt-1.5 font-bold">
                    প্রস্তুতকারী / ক্যাশিয়ার
                  </div>
                  <div className="text-[10px] text-[#141414]/60 mt-0.5">
                    Prepared By: {currentUser.name}
                  </div>
                </div>

                <div>
                  <div className="border-t border-[#141414] pt-1.5 font-bold">
                    নিরীক্ষক / ম্যানেজার
                  </div>
                  <div className="text-[10px] text-[#141414]/60 mt-0.5">
                    Checked &amp; Audited By
                  </div>
                </div>

                <div>
                  <div className="border-t border-[#141414] pt-1.5 font-bold">
                    অনুমোদনকারী / মালিক
                  </div>
                  <div className="text-[10px] text-[#141414]/60 mt-0.5">
                    Authorized Signature (Owner)
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-2 text-center text-[10px] font-mono-data text-[#141414]/50 border-t border-[#141414]/15">
                এটি তুলতুল ভিলা প্রপার্টি ম্যানেজমেন্ট সিস্টেমের একটি কম্পিউটার প্রস্তুতকৃত অফিসিয়াল স্টেটমেন্ট।
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
