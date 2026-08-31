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
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Printer,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Building2,
} from 'lucide-react';

export const CashBookView: React.FC = () => {
  const {
    cashBook,
    payments,
    expenses,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

  // Filtered Cash Book entries
  const filteredEntries = cashBook.filter((entry) => {
    const matchesMonth = entry.month === selectedMonth && entry.year === selectedYear;
    const matchesSearch =
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.reference && entry.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    return matchesMonth && matchesSearch && matchesType;
  });

  const totalInflow = filteredEntries
    .filter((e) => e.type === 'inflow')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalOutflow = filteredEntries
    .filter((e) => e.type === 'outflow')
    .reduce((acc, e) => acc + e.amount, 0);

  // Approximate Opening Balance for the month
  const openingBalance = 150000;
  const netCashFlow = totalInflow - totalOutflow;
  const closingBalance = openingBalance + netCashFlow;

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#144A29]" />
            <span>ক্যাশ বুক রেজিস্টার (Daily Cash Book)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            প্রতিদিনের নগদ জমা (ভাড়া আদায়), খরচ (Outflow) ও অবশিষ্ট ক্যাশ ব্যালেন্স
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Global Month/Year selector */}
          <div className="flex items-center gap-1 bg-[#DDDCD7] p-1 border border-[#141414]/30 text-xs font-mono-data">
            <span className="font-bold text-[#141414] px-1">মাস:</span>
            <select
              aria-label="ক্যাশ বুক মাস নির্বাচন"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#F4F3F0] font-bold text-[#144A29] px-1.5 py-0.5 border border-[#141414]/30 outline-none cursor-pointer"
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
              className="bg-[#F4F3F0] font-bold text-[#141414] px-1.5 py-0.5 border border-[#141414]/30 outline-none cursor-pointer"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-data font-bold text-[#141414] bg-[#DDDCD7] hover:bg-[#C8C7C2] border border-[#141414] transition-colors no-print cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট স্টেটমেন্ট</span>
          </button>
        </div>
      </div>

      {/* Cash Flow 4-Card Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-[#F4F3F0] p-3.5 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#141414]/70 flex items-center gap-1 uppercase">
            <Wallet className="w-3.5 h-3.5 text-[#141414]" />
            <span>প্রারম্ভিক ক্যাশ (Opening)</span>
          </span>
          <div className="text-xl font-mono-data font-bold text-[#141414] mt-1">
            {formatCurrency(openingBalance)}
          </div>
          <span className="text-[10px] font-mono-data text-[#141414]/60 mt-0.5 block">মাসের শুরুর উদ্বৃত্ত</span>
        </div>

        <div className="bg-[#E2EFE7] p-3.5 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#144A29] flex items-center gap-1 uppercase">
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#144A29]" />
            <span>মোট জমা (Inflow)</span>
          </span>
          <div className="text-xl font-mono-data font-bold text-[#144A29] mt-1">
            +{formatCurrency(totalInflow)}
          </div>
          <span className="text-[10px] font-mono-data text-[#144A29] mt-0.5 block">ভাড়া ও ইউটিলিটি আদায়</span>
        </div>

        <div className="bg-[#FCE8E8] p-3.5 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#801414] flex items-center gap-1 uppercase">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#801414]" />
            <span>মোট খরচ (Outflow)</span>
          </span>
          <div className="text-xl font-mono-data font-bold text-[#801414] mt-1">
            -{formatCurrency(totalOutflow)}
          </div>
          <span className="text-[10px] font-mono-data text-[#801414] mt-0.5 block">বিল্ডিং ও পরিচালন ব্যয়</span>
        </div>

        <div className="bg-[#141414] text-[#E4E3E0] p-3.5 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#DDDCD7] flex items-center gap-1 uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-[#86EFAC]" />
            <span>সমাপনী ব্যালেন্স (Closing)</span>
          </span>
          <div className="text-xl font-mono-data font-bold text-white mt-1">
            {formatCurrency(closingBalance)}
          </div>
          <span className="text-[10px] font-mono-data text-[#DDDCD7] mt-0.5 block">বর্তমান নগদ ক্যাশ স্থিতি</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex flex-col sm:flex-row gap-2.5 items-center justify-between no-print">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="বিবরণ বা রেফারেন্স দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1 text-xs font-mono-data bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="ক্যাশ লেনদেনের ধরন ফিল্টার"
            value={typeFilter}
            onChange={(e: any) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1 text-xs font-mono-data border border-[#141414]/30 bg-[#EBEAE6] text-[#141414] font-medium outline-none focus:border-[#141414] cursor-pointer"
          >
            <option value="all">সকল লেনদেন (জমা ও খরচ)</option>
            <option value="inflow">শুধুমাত্র জমা (Inflow)</option>
            <option value="outflow">শুধুমাত্র খরচ (Outflow)</option>
          </select>
        </div>
      </div>

      {/* Cash Book Table */}
      <div className="bg-[#F4F3F0] border border-[#141414] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tech-grid-table w-full text-left text-xs font-mono-data">
            <thead className="bg-[#DDDCD7] border-b border-[#141414] text-[#141414] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3 py-2 border-r border-[#141414]/20">তারিখ (Date)</th>
                <th className="px-3 py-2 border-r border-[#141414]/20">বিবরণ (Description)</th>
                <th className="px-3 py-2 border-r border-[#141414]/20">রেফারেন্স নং</th>
                <th className="px-3 py-2 text-right border-r border-[#141414]/20">জমা (Inflow ৳)</th>
                <th className="px-3 py-2 text-right border-r border-[#141414]/20">খরচ (Outflow ৳)</th>
                <th className="px-3 py-2 text-right">অবশিষ্ট ব্যালেন্স (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/15 text-[#141414]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#141414]/50">
                    এই মাসে কোন লেনদেনের তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isInflow = entry.type === 'inflow';

                  return (
                    <tr key={entry.id} className="hover:bg-[#EBEAE6] transition-colors">
                      <td className="px-3 py-2 font-semibold whitespace-nowrap border-r border-[#141414]/20">
                        {entry.date}
                      </td>

                      <td className="px-3 py-2 border-r border-[#141414]/20 font-sans">
                        <div className="font-bold text-[#141414] flex items-center gap-1.5">
                          {isInflow ? (
                            <span className="p-0.5 bg-[#D2E3D8] text-[#144A29] border border-[#144A29]/30">
                              <ArrowDownLeft className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="p-0.5 bg-[#FCE8E8] text-[#801414] border border-[#801414]/30">
                              <ArrowUpRight className="w-3 h-3" />
                            </span>
                          )}
                          <span>{entry.description}</span>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-[#141414]/70 text-[11px] border-r border-[#141414]/20">
                        {entry.reference || '---'}
                      </td>

                      <td className="px-3 py-2 text-right font-bold text-[#144A29] border-r border-[#141414]/20">
                        {isInflow ? `+${formatCurrency(entry.amount)}` : '---'}
                      </td>

                      <td className="px-3 py-2 text-right font-bold text-[#801414] border-r border-[#141414]/20">
                        {!isInflow ? `-${formatCurrency(entry.amount)}` : '---'}
                      </td>

                      <td className="px-3 py-2 text-right font-bold text-[#141414]">
                        {formatCurrency(entry.balance)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
