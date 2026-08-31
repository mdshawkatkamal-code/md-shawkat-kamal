import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  MONTHS,
  MONTHS_BN,
  formatDateBn,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  Building2,
  Store,
  Users,
  Receipt,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Scale,
  PlusCircle,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    flats,
    shops,
    tenants,
    bills,
    payments,
    expenses,
    selectedMonth,
    selectedYear,
    setActiveTab,
    generateMonthlyBills,
    currentUser,
    setSelectedReceiptModal,
  } = useApp();

  const isOwner = currentUser.role === 'owner';

  // Filter items for selected Month & Year
  const currentMonthBills = bills.filter(
    (b) => b.month === selectedMonth && b.year === selectedYear
  );
  const currentMonthPayments = payments.filter(
    (p) => p.month === selectedMonth && p.year === selectedYear
  );
  const currentMonthExpenses = expenses.filter(
    (e) => e.month === selectedMonth && e.year === selectedYear
  );

  // Financial aggregates
  const totalBillsAmount = currentMonthBills.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalCollectedAmount = currentMonthPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalDueAmount = Math.max(0, totalBillsAmount - totalCollectedAmount);
  const totalExpenseAmount = currentMonthExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netIncome = totalCollectedAmount - totalExpenseAmount;

  // Occupancy aggregates
  const totalFlats = flats.length;
  const occupiedFlats = flats.filter((f) => f.status === 'occupied').length;
  const vacantFlats = flats.filter((f) => f.status === 'vacant').length;

  const totalShops = shops.length;
  const occupiedShops = shops.filter((s) => s.status === 'occupied').length;
  const vacantShops = shops.filter((s) => s.status === 'vacant').length;

  const totalTenants = tenants.filter((t) => t.status === 'active').length;

  // Multi-Month Income trend data
  const monthlyChartData = [
    { monthEn: 'January', monthBn: 'জানুয়ারি', bill: 480000, income: 420000, expense: 110000, net: 310000 },
    { monthEn: 'February', monthBn: 'ফেব্রুয়ারি', bill: 490000, income: 450000, expense: 115000, net: 335000 },
    { monthEn: 'March', monthBn: 'মার্চ', bill: 500000, income: 480000, expense: 125000, net: 355000 },
    { monthEn: 'April', monthBn: 'এপ্রিল', bill: 520000, income: 510000, expense: 130000, net: 380000 },
    { monthEn: 'May', monthBn: 'মে', bill: 525000, income: 520000, expense: 122000, net: 398000 },
    { monthEn: 'June', monthBn: 'জুন', bill: 530000, income: 530000, expense: 128000, net: 402000 },
    { monthEn: 'July', monthBn: 'জুলাই', bill: 540000, income: 540000, expense: 135000, net: 405000 },
    {
      monthEn: 'August',
      monthBn: 'আগস্ট',
      bill: totalBillsAmount || 500000,
      income: totalCollectedAmount || 420000,
      expense: totalExpenseAmount || 120000,
      net: netIncome || 300000,
    },
  ];

  // Outstanding due items
  const outstandingBills = currentMonthBills
    .filter((b) => b.dueAmount > 0)
    .sort((a, b) => b.dueAmount - a.dueAmount)
    .slice(0, 5);

  const handleAutoGenerate = () => {
    const res = generateMonthlyBills(selectedMonth, selectedYear);
    alert(
      `স্বয়ংক্রিয় বিল তৈরি সম্পন্ন!\n• সফলভাবে তৈরি হয়েছে: ${res.generatedCount} টি বিল\n• পূর্বেই তৈরি ছিল: ${res.skippedCount} টি\nমাস: ${MONTHS_BN[selectedMonth] || selectedMonth} ${selectedYear}`
    );
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Banner: আজকের তারিখ | বর্তমান মাস | Current Year */}
      <div className="bg-[#141414] text-[#E4E3E0] p-4 sm:p-5 border border-[#141414]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#DDDCD7] font-mono-data text-xs tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#E4E3E0]" />
              <span>প্রপার্টি ও রেন্ট ড্যাশবোর্ড (Property &amp; Rent Overview)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif-heading font-bold mt-1 text-[#E4E3E0] flex items-center gap-2">
              <span>হিসাব ও পর্যবেক্ষণ ওভারভিউ</span>
              <span className="text-[11px] font-mono-data bg-[#DDDCD7]/20 text-[#E4E3E0] border border-[#DDDCD7]/30 px-2 py-0.5 font-medium">
                {isOwner ? 'মালিক মোড (Owner View)' : 'ম্যানেজার মোড (Manager View)'}
              </span>
            </h2>
            {/* Direct prompt specification: আজকের তারিখ | বর্তমান মাস | Current Year */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#DDDCD7] mt-2 font-mono-data">
              <span className="bg-[#2A2A28] px-2 py-0.5 border border-[#444] font-medium">
                📅 আজকের তারিখ: <strong className="text-white">{formatDateBn('2026-08-29')}</strong>
              </span>
              <span className="text-[#666]">|</span>
              <span className="bg-[#1F382B] text-[#86EFAC] border border-[#2F6546] px-2 py-0.5 font-medium">
                🗓️ বর্তমান মাস: <strong className="text-white">{MONTHS_BN[selectedMonth] || selectedMonth} {toBengaliNumber(selectedYear)}</strong>
              </span>
              <span className="text-[#666]">|</span>
              <span className="bg-[#262D42] text-[#93C5FD] border border-[#3B4D78] px-2 py-0.5 font-medium">
                🏛️ Current Year: <strong className="text-white">{toBengaliNumber(selectedYear)} ({selectedYear})</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap font-mono-data">
            <button
              onClick={handleAutoGenerate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#141414] bg-[#86EFAC] hover:bg-[#A7F3D0] border border-[#141414] transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>স্বয়ংক্রিয় বিল তৈরি ({MONTHS_BN[selectedMonth]})</span>
            </button>
            <button
              onClick={() => setActiveTab('payments-add')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#141414] bg-[#E4E3E0] hover:bg-[#FFFFFF] border border-[#141414] transition-colors cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>ভাড়া আদায় এন্ট্রি</span>
            </button>
          </div>
        </div>
      </div>

      {/* Technical Data Grid: Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {/* মোট ফ্ল্যাট */}
        <div
          onClick={() => setActiveTab('flats')}
          className="bg-[#F4F3F0] p-3.5 border border-[#141414] hover:bg-[#EBEAE6] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-data font-bold text-[#141414]/70 uppercase">মোট ফ্ল্যাট (Total Flats)</span>
            <Building2 className="w-4 h-4 text-[#141414]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono-data font-bold text-[#141414]">{toBengaliNumber(totalFlats)}</span>
            <span className="text-xs font-mono-data text-[#141414]/60">({totalFlats})</span>
          </div>
          <div className="mt-1 text-[11px] font-mono-data text-[#141414]/80 flex items-center gap-1">
            <span className="text-[#144A29] font-semibold">ভাড়াকৃত: {toBengaliNumber(occupiedFlats)}</span>
            <span className="text-[#141414]/30">|</span>
            <span className="text-[#8C6600] font-semibold">খালি: {toBengaliNumber(vacantFlats)}</span>
          </div>
        </div>

        {/* মোট দোকান */}
        <div
          onClick={() => setActiveTab('shops')}
          className="bg-[#F4F3F0] p-3.5 border border-[#141414] hover:bg-[#EBEAE6] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-data font-bold text-[#141414]/70 uppercase">মোট দোকান (Total Shops)</span>
            <Store className="w-4 h-4 text-[#141414]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono-data font-bold text-[#141414]">{toBengaliNumber(totalShops)}</span>
            <span className="text-xs font-mono-data text-[#141414]/60">({totalShops})</span>
          </div>
          <div className="mt-1 text-[11px] font-mono-data text-[#141414]/80 flex items-center gap-1">
            <span className="text-[#144A29] font-semibold">ভাড়াকৃত: {toBengaliNumber(occupiedShops)}</span>
            <span className="text-[#141414]/30">|</span>
            <span className="text-[#8C6600] font-semibold">খালি: {toBengaliNumber(vacantShops)}</span>
          </div>
        </div>

        {/* মোট ভাড়াটিয়া */}
        <div
          onClick={() => setActiveTab('tenants')}
          className="bg-[#F4F3F0] p-3.5 border border-[#141414] hover:bg-[#EBEAE6] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-data font-bold text-[#141414]/70 uppercase">মোট ভাড়াটিয়া (Tenants)</span>
            <Users className="w-4 h-4 text-[#141414]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono-data font-bold text-[#141414]">{toBengaliNumber(totalTenants)}</span>
            <span className="text-xs font-mono-data text-[#141414]/60">জন ({totalTenants})</span>
          </div>
          <div className="mt-1 text-[11px] font-mono-data text-[#141414]/70">
            ১০০% নথিবদ্ধ প্রোফাইল
          </div>
        </div>

        {/* এই মাসের মোট বিল */}
        <div
          onClick={() => setActiveTab('billing-monthly')}
          className="bg-[#F4F3F0] p-3.5 border border-[#141414] hover:bg-[#EBEAE6] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-data font-bold text-[#141414]/70 uppercase">এই মাসের মোট বিল</span>
            <FileSpreadsheet className="w-4 h-4 text-[#141414]" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-mono-data font-bold text-[#141414]">
              {formatCurrency(totalBillsAmount)}
            </span>
          </div>
          <div className="mt-1 text-[11px] font-mono-data text-[#141414]/60">
            {MONTHS_BN[selectedMonth]} {selectedYear}
          </div>
        </div>

        {/* এই মাসে আদায় */}
        <div
          onClick={() => setActiveTab('payments-history')}
          className="bg-[#E2EFE7] p-3.5 border border-[#141414] hover:bg-[#D5EADB] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-data font-bold text-[#144A29] uppercase">এই মাসে আদায় (Collected)</span>
            <CheckCircle2 className="w-4 h-4 text-[#144A29]" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-mono-data font-bold text-[#144A29]">
              {formatCurrency(totalCollectedAmount)}
            </span>
          </div>
          <div className="mt-1 text-[11px] font-mono-data text-[#144A29] font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>
              {totalBillsAmount > 0
                ? `${toBengaliNumber(Math.round((totalCollectedAmount / totalBillsAmount) * 100))}% আদায় সম্পন্ন`
                : 'আদায় এন্ট্রি'}
            </span>
          </div>
        </div>

        {/* এই মাসের বকেয়া */}
        <div
          onClick={() => setActiveTab('reports-due')}
          className="bg-[#F8EFE0] p-3.5 border border-[#141414] hover:bg-[#F3E5CD] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-data font-bold text-[#5C4300] uppercase">এই মাসের বকেয়া (Due)</span>
            <AlertCircle className="w-4 h-4 text-[#5C4300]" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-mono-data font-bold text-[#5C4300]">
              {formatCurrency(totalDueAmount)}
            </span>
          </div>
          <div className="mt-1 text-[11px] font-mono-data text-[#5C4300] font-medium">
            তাগাদা ও কালেকশন তালিকা
          </div>
        </div>

        {/* এই মাসের খরচ */}
        <div
          onClick={() => setActiveTab('expenses-history')}
          className="bg-[#FCE8E8] p-3.5 border border-[#141414] hover:bg-[#FADADA] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-data font-bold text-[#801414] uppercase">এই মাসের খরচ (Expense)</span>
            <TrendingDown className="w-4 h-4 text-[#801414]" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-mono-data font-bold text-[#801414]">
              {formatCurrency(totalExpenseAmount)}
            </span>
          </div>
          <div className="mt-1 text-[11px] font-mono-data text-[#801414]">
            ইউটিলিটি ও পরিচালনা
          </div>
        </div>

        {/* এই মাসের Net Income */}
        <div
          onClick={() => setActiveTab('reports-profit-loss')}
          className="bg-[#EAEAF8] p-3.5 border border-[#141414] hover:bg-[#DDDDF5] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-data font-bold text-[#141414] uppercase">এই মাসের Net Income</span>
            <Scale className="w-4 h-4 text-[#141414]" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-mono-data font-bold text-[#141414]">
              {formatCurrency(netIncome)}
            </span>
          </div>
          <div className="mt-1 text-[11px] font-mono-data text-[#141414] font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>আদায় − খরচ = নিট আয়</span>
          </div>
        </div>
      </div>

      {/* Monthly Income Chart (মাসিক আয়ের চার্ট) */}
      <div className="bg-[#F4F3F0] p-4 sm:p-5 border border-[#141414]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[#141414]/20">
          <div>
            <h3 className="text-base font-serif-heading font-bold text-[#141414] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#141414]" />
              <span>মাসিক আয় ও মুনাফা চার্ট (Monthly Income &amp; Net Profit Chart - ২০২৬)</span>
            </h3>
            <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
              Jan: ৳4,20,000 | Feb: ৳4,50,000 | Mar: ৳4,80,000 | Apr: ৳5,10,000 | Aug: {formatCurrency(totalCollectedAmount)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-data font-bold px-2 py-0.5 bg-[#DDDCD7] text-[#141414] border border-[#141414]/40">
              FY: ২০২৬ (2026)
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(20,20,20,0.15)" />
              <XAxis dataKey="monthBn" tickLine={false} tick={{ fill: '#141414', fontSize: 11, fontFamily: 'var(--f-mono)' }} />
              <YAxis
                tickLine={false}
                tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                tick={{ fill: '#141414', fontSize: 10, fontFamily: 'var(--f-mono)' }}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), '']}
                labelFormatter={(label) => `মাস: ${label} ২০২৬`}
                contentStyle={{ backgroundColor: '#141414', borderColor: '#141414', borderRadius: '0px', color: '#E4E3E0', fontSize: '11px', fontFamily: 'var(--f-mono)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'var(--f-mono)', paddingTop: '8px' }} />
              <Bar dataKey="income" name="আদায় (Income)" fill="#141414" />
              <Bar dataKey="expense" name="খরচ (Expense)" fill="#801414" />
              <Bar dataKey="net" name="নিট লাভ (Net Income)" fill="#144A29" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: High-Priority Due Collection & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Due Collection Focus */}
        <div className="bg-[#F4F3F0] p-4 border border-[#141414]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#141414]/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#801414]" />
              <div>
                <h4 className="text-xs font-mono-data font-bold text-[#141414] uppercase tracking-wider">
                  জরুরি বকেয়া তালিকা ({MONTHS_BN[selectedMonth]})
                </h4>
                <p className="text-[11px] text-[#141414]/60">বকেয়া ভাড়া ও ইউটিলিটি আদায়ের জন্য যোগাযোগ</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('reports-due')}
              className="text-xs font-mono-data font-bold text-[#141414] hover:underline"
            >
              সব দেখুন →
            </button>
          </div>

          <div className="space-y-1.5">
            {outstandingBills.length === 0 ? (
              <div className="text-center py-6 text-[#141414]/50 font-mono-data text-xs border border-dashed border-[#141414]/20">
                এই মাসে কোন বকেয়া নেই! সব ভাড়া ও বিল আদায় সম্পন্ন।
              </div>
            ) : (
              outstandingBills.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-2.5 bg-[#EBEAE6] hover:bg-[#DDDCD7] border border-[#141414]/20 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#141414]">{b.tenantName}</span>
                      <span className="font-mono-data text-[10px] font-bold px-1 bg-[#DDDCD7] border border-[#141414]/30 text-[#141414]">
                        {b.unitNumber}
                      </span>
                    </div>
                    <div className="font-mono-data text-[11px] text-[#141414]/70 mt-0.5">
                      মোট বিল: {formatCurrency(b.totalAmount)} | পরিশোধ: {formatCurrency(b.paidAmount)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono-data font-bold text-[#801414]">
                      বকেয়া: {formatCurrency(b.dueAmount)}
                    </div>
                    <button
                      onClick={() => setActiveTab('payments-add')}
                      className="mt-0.5 text-[10px] font-mono-data font-bold text-[#141414] hover:underline"
                    >
                      আদায় করুন →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Rent Payments */}
        <div className="bg-[#F4F3F0] p-4 border border-[#141414]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#141414]/20">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#144A29]" />
              <div>
                <h4 className="text-xs font-mono-data font-bold text-[#141414] uppercase tracking-wider">
                  সাম্প্রতিক ভাড়া আদায় ও মানি রিসিট
                </h4>
                <p className="text-[11px] text-[#141414]/60">সর্বশেষ পরিশোধিত ভাড়ার তথ্য</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('payments-history')}
              className="text-xs font-mono-data font-bold text-[#141414] hover:underline"
            >
              সব দেখুন →
            </button>
          </div>

          <div className="space-y-1.5">
            {currentMonthPayments.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 bg-[#EBEAE6] hover:bg-[#DDDCD7] border border-[#141414]/20 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#141414]">{p.tenantName}</span>
                    <span className="font-mono-data text-[10px] font-semibold px-1 bg-[#D2E3D8] text-[#144A29] border border-[#144A29]/30">
                      {p.unitNumber}
                    </span>
                    <span className="font-mono-data text-[10px] text-[#141414]/60">({p.paymentMethod.toUpperCase()})</span>
                  </div>
                  <div className="font-mono-data text-[11px] text-[#141414]/70 mt-0.5">
                    রিসিট: {p.receiptNumber} • তারিখ: {p.paymentDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono-data font-bold text-[#144A29]">
                    +{formatCurrency(p.amount)}
                  </div>
                  <button
                    onClick={() => setSelectedReceiptModal(p)}
                    className="mt-0.5 text-[10px] font-mono-data font-medium text-[#141414] hover:underline"
                  >
                    মানি রিসিট দেখুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
