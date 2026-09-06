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
import { CashBookStatementModal } from '../modals/CashBookStatementModal';
import {
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Printer,
  Calendar,
  Wallet,
  TrendingUp,
  FileText,
  PlusCircle,
  Download,
  CheckCircle2,
  Building2,
  Filter,
  X,
} from 'lucide-react';

export const CashBookView: React.FC = () => {
  const {
    cashBookEntries,
    payments,
    expenses,
    settings,
    currentUser,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    addCashBookEntry,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'cash' | 'bank' | 'mobile_banking'>('all');
  const [allTimeView, setAllTimeView] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);

  // Form state for manual cash transaction
  const [newEntryType, setNewEntryType] = useState<'in' | 'out'>('in');
  const [newEntryCategory, setNewEntryCategory] = useState('অন্যান্য নগদ প্রাপ্তি');
  const [newEntryDesc, setNewEntryDesc] = useState('');
  const [newEntryAmount, setNewEntryAmount] = useState('');
  const [newEntrySource, setNewEntrySource] = useState('');
  const [newEntryRef, setNewEntryRef] = useState('');
  const [newEntryDate, setNewEntryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // 1. Compile unified cash ledger
  const allTransactions = compileCashTransactions(
    payments,
    expenses,
    cashBookEntries,
    settings.openingCashBalance || 250000
  );

  // 2. Get period summary
  const { filteredTransactions: periodTransactions, summary } = getPeriodCashSummary(
    allTransactions,
    {
      month: allTimeView ? undefined : selectedMonth,
      year: allTimeView ? undefined : selectedYear,
      allTime: allTimeView,
      baseOpeningBalance: settings.openingCashBalance || 250000,
    }
  );

  // 3. Filter display entries
  const displayEntries = periodTransactions.filter((entry) => {
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'inflow' && entry.type === 'inflow') ||
      (typeFilter === 'outflow' && entry.type === 'outflow');

    const matchesMethod =
      methodFilter === 'all' || entry.paymentMethod === methodFilter;

    const desc = entry.description || '';
    const ref = entry.referenceNo || '';
    const src = entry.sourceOrPayee || '';
    const cat = entry.category || '';
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      desc.toLowerCase().includes(searchLower) ||
      ref.toLowerCase().includes(searchLower) ||
      src.toLowerCase().includes(searchLower) ||
      cat.toLowerCase().includes(searchLower);

    return matchesType && matchesMethod && matchesSearch;
  });

  const handleCreateManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newEntryAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('সঠিক টাকার পরিমাণ লিখুন');
      return;
    }

    if (!newEntryDesc.trim()) {
      alert('লেনদেনের বিবরণ লিখুন');
      return;
    }

    addCashBookEntry({
      date: newEntryDate,
      month: selectedMonth,
      year: selectedYear,
      type: newEntryType,
      category: newEntryCategory,
      description: newEntryDesc.trim(),
      amount: amountNum,
      sourceOrPayee: newEntrySource.trim() || (newEntryType === 'in' ? 'প্রাপ্তি' : 'ব্যয়'),
      referenceId: newEntryRef.trim() || `MAN-${Date.now()}`,
      recordedBy: currentUser.name,
    });

    setFeedbackMsg(
      `নতুন নগদ ${newEntryType === 'in' ? 'জমা' : 'খরচ'} ৳${amountNum.toLocaleString()} সফলভাবে যোগ করা হয়েছে!`
    );
    setTimeout(() => setFeedbackMsg(''), 4000);

    // Reset form
    setNewEntryAmount('');
    setNewEntryDesc('');
    setNewEntrySource('');
    setNewEntryRef('');
    setIsAddEntryModalOpen(false);
  };

  const handleExport = () => {
    const periodTag = allTimeView ? 'All_Time' : `${selectedMonth}_${selectedYear}`;
    exportCashBookCSV(displayEntries, `CashBook_Register_${periodTag}.csv`);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#144A29]" />
            <span>ক্যাশ বুক রেজিস্টার ও স্টেটমেন্ট (Daily Cash Book)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            দৈনিক নগদ জমা (ভাড়া ও ইউটিলিটি আদায়), পরিচালনা খরচ এবং বর্তমান ক্যাশ স্থিতি
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 no-print font-mono-data">
          {/* Statement View Modal Trigger */}
          <button
            onClick={() => setIsStatementModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#144A29] hover:bg-[#0E351D] border border-[#141414] shadow-xs cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>স্টেটমেন্ট দেখুন ও প্রিন্ট</span>
          </button>

          {/* Direct Print */}
          <button
            onClick={() => setIsStatementModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#141414] bg-[#DDDCD7] hover:bg-[#C8C7C2] border border-[#141414] cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট প্রিভিউ ও প্রিন্ট</span>
          </button>

          {/* Add Manual Cash Entry */}
          <button
            onClick={() => setIsAddEntryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#141414] bg-[#EBEAE6] hover:bg-[#DDDCD7] border border-[#141414] cursor-pointer transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#144A29]" />
            <span>+ নতুন লেনদেন</span>
          </button>

          {/* Export to CSV */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-[#141414] bg-[#EBEAE6] hover:bg-[#DDDCD7] border border-[#141414]/40 cursor-pointer transition-colors"
            title="এক্সেল (CSV) ডাউনলোড"
          >
            <Download className="w-3.5 h-3.5" />
            <span>এক্সেল</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-2.5 bg-[#E2EFE7] border border-[#144A29] text-[#144A29] text-xs flex items-center gap-2 font-mono-data font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Cash Flow 4-Card Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-[#F4F3F0] p-3.5 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#141414]/70 flex items-center gap-1 uppercase">
            <Wallet className="w-3.5 h-3.5 text-[#141414]" />
            <span>প্রারম্ভিক ক্যাশ (Opening)</span>
          </span>
          <div className="text-xl font-mono-data font-bold text-[#141414] mt-1">
            {formatCurrency(summary.periodOpeningBalance)}
          </div>
          <span className="text-[10px] font-mono-data text-[#141414]/60 mt-0.5 block">
            {allTimeView ? 'মূল ভিত্তি উদ্বৃত্ত' : `${MONTHS_BN[selectedMonth]} মাসের শুরুর ব্যালেন্স`}
          </span>
        </div>

        <div className="bg-[#E2EFE7] p-3.5 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#144A29] flex items-center gap-1 uppercase">
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#144A29]" />
            <span>মোট জমা (Inflow)</span>
          </span>
          <div className="text-xl font-mono-data font-bold text-[#144A29] mt-1">
            +{formatCurrency(summary.totalInflow)}
          </div>
          <span className="text-[10px] font-mono-data text-[#144A29] mt-0.5 block">
            {toBengaliNumber(summary.inflowCount)} টি ভাড়া ও প্রাপ্তি
          </span>
        </div>

        <div className="bg-[#FCE8E8] p-3.5 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#801414] flex items-center gap-1 uppercase">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#801414]" />
            <span>মোট খরচ (Outflow)</span>
          </span>
          <div className="text-xl font-mono-data font-bold text-[#801414] mt-1">
            -{formatCurrency(summary.totalOutflow)}
          </div>
          <span className="text-[10px] font-mono-data text-[#801414] mt-0.5 block">
            {toBengaliNumber(summary.outflowCount)} টি ব্যয় ভাউচার
          </span>
        </div>

        <div className="bg-[#141414] text-[#E4E3E0] p-3.5 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#DDDCD7] flex items-center gap-1 uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-[#86EFAC]" />
            <span>সমাপনী ব্যালেন্স (Closing)</span>
          </span>
          <div className="text-xl font-mono-data font-bold text-white mt-1">
            {formatCurrency(summary.periodClosingBalance)}
          </div>
          <span className="text-[10px] font-mono-data text-[#DDDCD7] mt-0.5 block">
            বর্তমান নগদ ক্যাশ স্থিতি
          </span>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex flex-col md:flex-row gap-3 items-center justify-between no-print font-mono-data text-xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#141414]/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="বিবরণ, রেফারেন্স বা উৎস দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Month / Year Selector */}
          {!allTimeView ? (
            <div className="flex items-center gap-1 bg-[#EBEAE6] px-2 py-1 border border-[#141414]/30">
              <span className="font-bold text-[#141414]/70">মাস:</span>
              <select
                aria-label="ক্যাশ বুক মাস নির্বাচন"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="font-bold text-[#144A29] bg-transparent outline-none cursor-pointer"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {MONTHS_BN[m]} ({m})
                  </option>
                ))}
              </select>
              <select
                aria-label="ক্যাশ বুক বছর নির্বাচন"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="font-bold text-[#141414] bg-transparent outline-none cursor-pointer"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          ) : (
            <div className="bg-[#141414] text-white px-2.5 py-1 text-xs font-bold">
              সকল রেকর্ড দৃশ্যমান
            </div>
          )}

          {/* Toggle All Time */}
          <button
            onClick={() => setAllTimeView(!allTimeView)}
            className={`px-2.5 py-1 font-bold border transition-colors cursor-pointer ${
              allTimeView
                ? 'bg-[#141414] text-white border-[#141414]'
                : 'bg-[#EBEAE6] text-[#141414] border-[#141414]/30 hover:bg-[#DDDCD7]'
            }`}
          >
            {allTimeView ? 'মাসিক ফিল্টারে ফিরুন' : 'সকল রেকর্ড'}
          </button>

          {/* Type Filter */}
          <select
            aria-label="ক্যাশ লেনদেনের ধরন ফিল্টার"
            value={typeFilter}
            onChange={(e: any) => setTypeFilter(e.target.value)}
            className="px-2 py-1 border border-[#141414]/30 bg-[#EBEAE6] text-[#141414] font-medium outline-none cursor-pointer"
          >
            <option value="all">সকল ধরন (জমা ও খরচ)</option>
            <option value="inflow">শুধুমাত্র জমা (Inflow)</option>
            <option value="outflow">শুধুমাত্র খরচ (Outflow)</option>
          </select>

          {/* Method Filter */}
          <select
            aria-label="পেমেন্ট মাধ্যম ফিল্টার"
            value={methodFilter}
            onChange={(e: any) => setMethodFilter(e.target.value)}
            className="px-2 py-1 border border-[#141414]/30 bg-[#EBEAE6] text-[#141414] font-medium outline-none cursor-pointer"
          >
            <option value="all">সকল মাধ্যম</option>
            <option value="cash">নগদ (Cash)</option>
            <option value="bank">ব্যাংক (Bank)</option>
            <option value="mobile_banking">মোবাইল ব্যাংকিং (bKash/Nagad)</option>
          </select>
        </div>
      </div>

      {/* Main Cash Book Table / Printable Area */}
      <div id="printable-cashbook" className="bg-[#F4F3F0] border border-[#141414] overflow-hidden printable-content">
        {/* Printable Header (Visible when printed) */}
        <div className="hidden print:block p-4 border-b border-[#141414] text-center">
          <h1 className="text-xl font-serif-heading font-bold text-[#141414]">
            {settings.propertyNameBn || settings.propertyName}
          </h1>
          <p className="text-xs font-mono-data text-[#141414]/80">{settings.addressBn || settings.address}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-[#141414] text-white font-bold text-xs">
            দৈনিক ক্যাশ বুক রেজিস্টার — {allTimeView ? 'সকল রেকর্ড' : `${MONTHS_BN[selectedMonth]} ${selectedYear}`}
          </div>
          <div className="flex justify-between text-[10px] font-mono-data mt-2 pt-2 border-t border-[#141414]/20">
            <span>প্রারম্ভিক স্থিতি: {formatCurrency(summary.periodOpeningBalance)}</span>
            <span>মোট জমা: +{formatCurrency(summary.totalInflow)}</span>
            <span>মোট খরচ: -{formatCurrency(summary.totalOutflow)}</span>
            <span className="font-bold">সমাপনী স্থিতি: {formatCurrency(summary.periodClosingBalance)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="tech-grid-table w-full text-left text-xs font-mono-data">
            <thead className="bg-[#DDDCD7] border-b border-[#141414] text-[#141414] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3 py-2.5 border-r border-[#141414]/20 w-10 text-center">ক্র.</th>
                <th className="px-3 py-2.5 border-r border-[#141414]/20 whitespace-nowrap">তারিখ (Date)</th>
                <th className="px-3 py-2.5 border-r border-[#141414]/20">বিবরণ ও বিবরণী (Description)</th>
                <th className="px-3 py-2.5 border-r border-[#141414]/20 whitespace-nowrap">রেফারেন্স / ভাউচার</th>
                <th className="px-3 py-2.5 border-r border-[#141414]/20 text-center whitespace-nowrap">মাধ্যম</th>
                <th className="px-3 py-2.5 text-right border-r border-[#141414]/20 whitespace-nowrap">
                  জমা / Inflow (৳)
                </th>
                <th className="px-3 py-2.5 text-right border-r border-[#141414]/20 whitespace-nowrap">
                  খরচ / Outflow (৳)
                </th>
                <th className="px-3 py-2.5 text-right whitespace-nowrap">অবশিষ্ট ব্যালেন্স (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/15 text-[#141414]">
              {/* Opening balance row */}
              <tr className="bg-[#EBEAE6] font-bold text-xs">
                <td className="px-3 py-2 text-center border-r border-[#141414]/20">--</td>
                <td className="px-3 py-2 whitespace-nowrap border-r border-[#141414]/20">
                  {allTimeView ? 'শুরু' : `০১ ${MONTHS_BN[selectedMonth]}`}
                </td>
                <td colSpan={3} className="px-3 py-2 border-r border-[#141414]/20">
                  প্রারম্ভিক নগদ ক্যাশ স্থিতি (Opening Balance B/F)
                </td>
                <td className="px-3 py-2 text-right border-r border-[#141414]/20 text-[#141414]/40">---</td>
                <td className="px-3 py-2 text-right border-r border-[#141414]/20 text-[#141414]/40">---</td>
                <td className="px-3 py-2 text-right font-bold text-[#141414]">
                  {formatCurrency(summary.periodOpeningBalance)}
                </td>
              </tr>

              {displayEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-[#141414]/50 font-sans">
                    এই ফিল্টারে কোন ক্যাশ লেনদেনের রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                displayEntries.map((entry, index) => {
                  const entryIsInflow = entry.type === 'inflow';
                  const methodText =
                    entry.paymentMethod === 'cash'
                      ? 'নগদ'
                      : entry.paymentMethod === 'bank'
                      ? 'ব্যাংক'
                      : entry.paymentMethod === 'mobile_banking'
                      ? 'বিকাশ/নগদ'
                      : entry.paymentMethod;

                  return (
                    <tr key={entry.id} className="hover:bg-[#EBEAE6] transition-colors">
                      <td className="px-3 py-2 text-center text-[#141414]/70 border-r border-[#141414]/20">
                        {toBengaliNumber(index + 1)}
                      </td>

                      <td className="px-3 py-2 font-semibold whitespace-nowrap border-r border-[#141414]/20">
                        {entry.date}
                      </td>

                      <td className="px-3 py-2 border-r border-[#141414]/20 font-sans">
                        <div className="font-bold text-[#141414] flex items-center gap-1.5">
                          {entryIsInflow ? (
                            <span className="p-0.5 bg-[#D2E3D8] text-[#144A29] border border-[#144A29]/30 shrink-0">
                              <ArrowDownLeft className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="p-0.5 bg-[#FCE8E8] text-[#801414] border border-[#801414]/30 shrink-0">
                              <ArrowUpRight className="w-3 h-3" />
                            </span>
                          )}
                          <span>{entry.description}</span>
                        </div>
                        <div className="text-[10px] text-[#141414]/60 font-mono-data mt-0.5">
                          উৎস/প্রাপক: {entry.sourceOrPayee} • ক্যাটাগরি: {entry.category}
                        </div>
                      </td>

                      <td className="px-3 py-2 text-[#141414]/80 text-[11px] border-r border-[#141414]/20 whitespace-nowrap">
                        {entry.referenceNo}
                      </td>

                      <td className="px-3 py-2 text-center text-[10px] border-r border-[#141414]/20 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 bg-[#EBEAE6] border border-[#141414]/20 font-semibold">
                          {methodText}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-right font-bold text-[#144A29] border-r border-[#141414]/20 whitespace-nowrap">
                        {entryIsInflow ? `+${formatCurrency(entry.amount)}` : '---'}
                      </td>

                      <td className="px-3 py-2 text-right font-bold text-[#801414] border-r border-[#141414]/20 whitespace-nowrap">
                        {!entryIsInflow ? `-${formatCurrency(entry.amount)}` : '---'}
                      </td>

                      <td className="px-3 py-2 text-right font-bold text-[#141414] whitespace-nowrap">
                        {formatCurrency(entry.runningBalance)}
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Total summary row */}
              <tr className="bg-[#DDDCD7] border-t-2 border-[#141414] font-bold text-xs">
                <td colSpan={5} className="px-3 py-2.5 text-right uppercase border-r border-[#141414]/30">
                  মোট যোগফল (Total):
                </td>
                <td className="px-3 py-2.5 text-right text-[#144A29] border-r border-[#141414]/30">
                  +{formatCurrency(summary.totalInflow)}
                </td>
                <td className="px-3 py-2.5 text-right text-[#801414] border-r border-[#141414]/30">
                  -{formatCurrency(summary.totalOutflow)}
                </td>
                <td className="px-3 py-2.5 text-right text-[#141414] bg-[#C8C7C2]">
                  {formatCurrency(summary.periodClosingBalance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Printable Signatures Strip */}
        <div className="hidden print:grid grid-cols-3 gap-6 text-center text-xs font-mono-data pt-10 pb-4 px-6">
          <div className="border-t border-[#141414] pt-1">ক্যাশিয়ার / প্রস্তুতকারী</div>
          <div className="border-t border-[#141414] pt-1">ম্যানেজার / নিরীক্ষক</div>
          <div className="border-t border-[#141414] pt-1">অনুমোদিত স্বাক্ষর (মালিক)</div>
        </div>
      </div>

      {/* Modal: Comprehensive Cash Book Statement */}
      {isStatementModalOpen && (
        <CashBookStatementModal
          onClose={() => setIsStatementModalOpen(false)}
          defaultMonth={selectedMonth}
          defaultYear={selectedYear}
        />
      )}

      {/* Modal: Add Manual Cash Transaction */}
      {isAddEntryModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#141414]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-[#F4F3F0] max-w-lg w-full p-5 sm:p-6 border-2 border-[#141414] shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#141414]/20 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#144A29]" />
                <h3 className="font-serif-heading font-bold text-[#141414] text-base">
                  নতুন ক্যাশ বুক লেনদেন যোগ করুন
                </h3>
              </div>
              <button
                onClick={() => setIsAddEntryModalOpen(false)}
                className="text-[#141414]/60 hover:text-[#141414] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualEntry} className="space-y-3.5 text-xs font-mono-data">
              {/* Inflow vs Outflow radio */}
              <div>
                <label className="block font-bold text-[#141414] mb-1">লেনদেনের ধরন:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewEntryType('in');
                      setNewEntryCategory('অন্যান্য নগদ প্রাপ্তি');
                    }}
                    className={`py-2 px-3 font-bold border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      newEntryType === 'in'
                        ? 'bg-[#144A29] text-white border-[#144A29]'
                        : 'bg-[#EBEAE6] text-[#141414] border-[#141414]/30'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>নগদ জমা (Inflow)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewEntryType('out');
                      setNewEntryCategory('অন্যান্য নগদ খরচ');
                    }}
                    className={`py-2 px-3 font-bold border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      newEntryType === 'out'
                        ? 'bg-[#801414] text-white border-[#801414]'
                        : 'bg-[#EBEAE6] text-[#141414] border-[#141414]/30'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>নগদ খরচ (Outflow)</span>
                  </button>
                </div>
              </div>

              {/* Date & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">তারিখ:</label>
                  <input
                    type="date"
                    value={newEntryDate}
                    onChange={(e) => setNewEntryDate(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#141414] mb-1">টাকার পরিমাণ (৳):</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="টাকা লিখুন"
                    value={newEntryAmount}
                    onChange={(e) => setNewEntryAmount(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414] font-bold text-[#141414]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-[#141414] mb-1">ক্যাটাগরি:</label>
                <select
                  value={newEntryCategory}
                  onChange={(e) => setNewEntryCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414] font-bold cursor-pointer"
                >
                  {newEntryType === 'in' ? (
                    <>
                      <option value="ভাড়া ও ইউটিলিটি আদায়">ভাড়া ও ইউটিলিটি আদায়</option>
                      <option value="মালিকের মূলধন বিনিয়োগ">মালিকের মূলধন বিনিয়োগ (Owner Capital)</option>
                      <option value="জামানত জমা">সিকিউরিটি ডিপোজিট / জামানত</option>
                      <option value="স্ক্র্যাপ / পুরাতন মালামাল বিক্রয়">পুরাতন মালামাল বিক্রয়</option>
                      <option value="অন্যান্য নগদ প্রাপ্তি">অন্যান্য নগদ প্রাপ্তি</option>
                    </>
                  ) : (
                    <>
                      <option value="বিদ্যুৎ ও ইউটিলিটি বিল">বিদ্যুৎ ও ইউটিলিটি বিল</option>
                      <option value="কর্মচারী বেতন">কর্মচারী / গার্ড / সুইপার বেতন</option>
                      <option value="রক্ষণাবেক্ষণ ও মেরামত">রক্ষণাবেক্ষণ ও মেরামত</option>
                      <option value="ব্যাংক জমা">ব্যাংক একাউন্টে নগদ জমা</option>
                      <option value="মালিকের উত্তোলন">মালিকের ব্যক্তিগত উত্তোলন</option>
                      <option value="অন্যান্য নগদ খরচ">অন্যান্য নগদ খরচ</option>
                    </>
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-[#141414] mb-1">বিবরণ (Description):</label>
                <input
                  type="text"
                  placeholder="যেমন: জেনারেটরের ডিজেল ক্রয়, পানির মোটর সার্ভিসিং..."
                  value={newEntryDesc}
                  onChange={(e) => setNewEntryDesc(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414] font-sans"
                />
              </div>

              {/* Source / Payee & Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">
                    {newEntryType === 'in' ? 'উৎস / কার নিকট হতে:' : 'প্রাপক / কাকে দেওয়া হল:'}
                  </label>
                  <input
                    type="text"
                    placeholder={newEntryType === 'in' ? 'নাম / ব্যক্তি' : 'দোকান / কারিগর'}
                    value={newEntrySource}
                    onChange={(e) => setNewEntrySource(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#141414] mb-1">ভাউচার / রেফারেন্স নং:</label>
                  <input
                    type="text"
                    placeholder="যেমন: CB-012"
                    value={newEntryRef}
                    onChange={(e) => setNewEntryRef(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#141414]/20">
                <button
                  type="button"
                  onClick={() => setIsAddEntryModalOpen(false)}
                  className="px-3 py-1.5 bg-[#DDDCD7] hover:bg-[#C8C7C2] text-[#141414] font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#141414] hover:bg-[#2A2A28] text-white font-bold cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
