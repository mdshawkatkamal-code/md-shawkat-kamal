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
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  FileText,
  Calendar,
  Printer,
  Search,
  CheckCircle2,
  PieChart as PieIcon,
  Download,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ReportsViewProps {
  initialReportType?:
    | 'income'
    | 'expense'
    | 'profit_loss'
    | 'due'
    | 'tenant_statement'
    | 'yearly';
}

export const ReportsView: React.FC<ReportsViewProps> = ({ initialReportType = 'profit_loss' }) => {
  const {
    bills,
    payments,
    expenses,
    tenants,
    flats,
    shops,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    setSelectedStatementModal,
  } = useApp();

  const [activeReport, setActiveReport] = useState<
    'income' | 'expense' | 'profit_loss' | 'due' | 'tenant_statement' | 'yearly'
  >(initialReportType);

  const [tenantSearch, setTenantSearch] = useState('');

  // Calculations for selected Month+Year
  const monthPayments = payments.filter((p) => p.month === selectedMonth && p.year === selectedYear);
  const totalIncome = monthPayments.reduce((acc, p) => acc + p.amount, 0);

  const monthExpenses = expenses.filter((e) => e.month === selectedMonth && e.year === selectedYear);
  const totalExpense = monthExpenses.reduce((acc, e) => acc + e.amount, 0);

  const monthBills = bills.filter((b) => b.month === selectedMonth && b.year === selectedYear);
  const totalBilled = monthBills.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalDue = monthBills.reduce((acc, b) => acc + b.dueAmount, 0);

  const netProfit = totalIncome - totalExpense;
  const isProfitable = netProfit >= 0;

  // Expense breakdown by category
  const expenseByCategoryMap: { [key: string]: number } = {};
  monthExpenses.forEach((e) => {
    expenseByCategoryMap[e.category] = (expenseByCategoryMap[e.category] || 0) + e.amount;
  });
  const expensePieData = Object.keys(expenseByCategoryMap).map((key) => ({
    name: key,
    value: expenseByCategoryMap[key],
  }));

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#14b8a6', '#f43f5e'];

  // 12 Months Yearly Aggregation for selected Year
  const yearlyMonthsData = MONTHS.map((m) => {
    const inc = payments
      .filter((p) => p.month === m && p.year === selectedYear)
      .reduce((acc, p) => acc + p.amount, 0);
    const exp = expenses
      .filter((e) => e.month === m && e.year === selectedYear)
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

  // Overdue Tenants list
  const dueTenantsList = tenants
    .map((tenant) => {
      const tBills = bills.filter((b) => b.tenantId === tenant.id);
      const totalB = tBills.reduce((acc, b) => acc + b.totalAmount, 0);
      const totalP = tBills.reduce((acc, b) => acc + b.paidAmount, 0);
      const due = Math.max(0, totalB - totalP);
      return {
        tenant,
        totalB,
        totalP,
        due,
      };
    })
    .filter((t) => t.due > 0)
    .sort((a, b) => b.due - a.due);

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#141414]" />
            <span>আর্থিক ও অডিট রিপোর্ট (Financial Reports &amp; Statements)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            মাসিক ও বার্ষিক আয়-ব্যয়, লাভ-ক্ষতি, বকেয়া তালিকা এবং ভাড়াটিয়ার অফিসিয়াল স্টেটমেন্ট
          </p>
        </div>

        {/* Month / Year Selectors */}
        <div className="flex items-center gap-2 font-mono-data">
          <div className="flex items-center gap-1 bg-[#F4F3F0] px-2.5 py-1 border border-[#141414] text-xs">
            <span className="font-bold text-[#141414]/60">মাস:</span>
            <select
              aria-label="রিপোর্ট মাস নির্বাচন"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="font-bold text-[#141414] outline-none cursor-pointer bg-transparent"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {MONTHS_BN[m]} ({m})
                </option>
              ))}
            </select>
            <select
              aria-label="রিপোর্ট বছর নির্বাচন"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="font-bold text-[#141414] outline-none cursor-pointer bg-transparent"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#141414] bg-[#EBEAE6] hover:bg-[#DDDCD7] border border-[#141414] transition-colors no-print cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট রিপোর্ট</span>
          </button>
        </div>
      </div>

      {/* 6 Report Sub-Tabs (Requirement 9) */}
      <div className="flex items-center border-b border-[#141414]/20 gap-1 overflow-x-auto pb-0.5 font-mono-data">
        <button
          onClick={() => setActiveReport('profit_loss')}
          className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeReport === 'profit_loss'
              ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
              : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>লাভ-ক্ষতি রিপোর্ট (Profit &amp; Loss)</span>
        </button>

        <button
          onClick={() => setActiveReport('income')}
          className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeReport === 'income'
              ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
              : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>মাসিক মোট আয় (Monthly Income)</span>
        </button>

        <button
          onClick={() => setActiveReport('expense')}
          className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeReport === 'expense'
              ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
              : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>মাসিক মোট ব্যয় (Monthly Expense)</span>
        </button>

        <button
          onClick={() => setActiveReport('due')}
          className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeReport === 'due'
              ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
              : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>বকেয়া রিপোর্ট (Due Report)</span>
        </button>

        <button
          onClick={() => setActiveReport('tenant_statement')}
          className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeReport === 'tenant_statement'
              ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
              : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>ভাড়াটিয়া স্টেটমেন্ট (Tenant Statement)</span>
        </button>

        <button
          onClick={() => setActiveReport('yearly')}
          className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeReport === 'yearly'
              ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
              : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>বার্ষিক রিপোর্ট ({selectedYear})</span>
        </button>
      </div>

      {/* REPORT 1: Profit & Loss (Requirement 10) */}
      {activeReport === 'profit_loss' && (
        <div className="space-y-4 font-mono-data">
          {/* Summary Box */}
          <div className="bg-[#F4F3F0] p-4 border border-[#141414] space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#141414]/15">
              <div>
                <h3 className="text-sm font-serif-heading font-bold text-[#141414]">
                  লাভ ও ক্ষতি বিবরণী (Profit / Loss Statement)
                </h3>
                <p className="text-xs text-[#141414]/70">
                  সময়কাল: {MONTHS_BN[selectedMonth]} {selectedYear}
                </p>
              </div>
              <div
                className={`px-2.5 py-0.5 border text-xs font-bold ${
                  isProfitable ? 'bg-[#E0F2E9] border-[#141414] text-[#14532D]' : 'bg-[#FCE8E8] border-[#141414] text-[#801414]'
                }`}
              >
                {isProfitable ? 'লাভজনক (PROFITABLE)' : 'লোকসান (LOSS)'}
              </div>
            </div>

            {/* Profit Loss Equation Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-[#EBEAE6] border border-[#141414]">
                <span className="text-xs font-bold text-[#141414]">মোট সংগৃহীত আয় (Income)</span>
                <div className="text-lg font-bold text-[#14532D] mt-1">
                  +{formatCurrency(totalIncome)}
                </div>
                <span className="text-[10px] text-[#141414]/60 mt-0.5 block">ভাড়া ও ইউটিলিটি চার্জ আদায়</span>
              </div>

              <div className="p-3 bg-[#EBEAE6] border border-[#141414]">
                <span className="text-xs font-bold text-[#141414]">মোট পরিচালন ব্যয় (Expense)</span>
                <div className="text-lg font-bold text-[#801414] mt-1">
                  -{formatCurrency(totalExpense)}
                </div>
                <span className="text-[10px] text-[#141414]/60 mt-0.5 block">বিল্ডিং রক্ষণাবেক্ষণ ও স্টাফ ব্যয়</span>
              </div>

              <div className="p-3 bg-[#141414] text-[#E4E3E0] border border-[#141414]">
                <span className="text-xs font-bold text-[#E4E3E0]/70">নিট লাভ / মুনাফা (Net Profit)</span>
                <div className="text-xl font-bold text-white mt-1">
                  {formatCurrency(netProfit)}
                </div>
                <span className="text-[10px] text-[#E4E3E0]/60 mt-0.5 block">
                  আয় থেকে মোট ব্যয় বাদ দিয়ে অবশিষ্ট
                </span>
              </div>
            </div>

            {/* Income vs Expense Bar Chart */}
            <div className="pt-3 border-t border-[#141414]/15">
              <h4 className="text-xs font-bold text-[#141414] mb-3">আয় ও ব্যয়ের গ্রাফিক্যাল তুলনা</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: `${MONTHS_BN[selectedMonth]} ${selectedYear}`,
                        Income: totalIncome,
                        Expense: totalExpense,
                        Profit: netProfit,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDDCD7" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#141414' }} stroke="#141414" />
                    <YAxis tick={{ fontSize: 11, fill: '#141414' }} stroke="#141414" />
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val))}
                      contentStyle={{ backgroundColor: '#F4F3F0', borderColor: '#141414', borderRadius: 0, fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}
                    />
                    <Legend />
                    <Bar dataKey="Income" name="মোট আয় (Income)" fill="#14532D" />
                    <Bar dataKey="Expense" name="মোট ব্যয় (Expense)" fill="#801414" />
                    <Bar dataKey="Profit" name="নিট লাভ (Profit)" fill="#141414" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: Monthly Income */}
      {activeReport === 'income' && (
        <div className="space-y-3 font-mono-data">
          <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#141414]">
                {MONTHS_BN[selectedMonth]} {selectedYear} মাসের আয়ের তালিকা
              </h3>
              <p className="text-[11px] text-[#141414]/70">মোট আদায় হয়েছে {monthPayments.length}টি পেমেন্ট</p>
            </div>
            <div className="text-base font-bold text-[#14532D]">
              {formatCurrency(totalIncome)}
            </div>
          </div>

          <div className="bg-[#F4F3F0] border border-[#141414] overflow-hidden">
            <table className="w-full text-left text-xs tech-grid-table">
              <thead className="bg-[#EBEAE6] border-b border-[#141414] text-[#141414] font-bold">
                <tr>
                  <th className="px-3.5 py-2.5">রিসিট নং ও তারিখ</th>
                  <th className="px-3.5 py-2.5">ভাড়াটিয়া ও ইউনিট</th>
                  <th className="px-3.5 py-2.5">পেমেন্ট মাধ্যম</th>
                  <th className="px-3.5 py-2.5 text-right">আদায়কৃত টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]/15 text-[#141414]">
                {monthPayments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-[#141414]/50">
                      এই মাসে কোন আয়ের রেকর্ড নেই।
                    </td>
                  </tr>
                ) : (
                  monthPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#EBEAE6]">
                      <td className="px-3.5 py-2.5 font-bold text-[#141414]">
                        {p.receiptNumber} <span className="font-normal text-[11px] text-[#141414]/60">({p.paymentDate})</span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="font-bold text-[#141414]">{p.tenantName}</div>
                        <div className="text-[#141414]/60 text-[11px]">{p.unitNumber}</div>
                      </td>
                      <td className="px-3.5 py-2.5 uppercase text-[#141414]/80 font-medium">
                        {p.paymentMethod} {p.reference ? `(${p.reference})` : ''}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-bold text-[#14532D]">
                        +{formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: Monthly Expense */}
      {activeReport === 'expense' && (
        <div className="space-y-3 font-mono-data">
          <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#141414]">
                {MONTHS_BN[selectedMonth]} {selectedYear} মাসের ব্যয়ের তালিকা
              </h3>
              <p className="text-[11px] text-[#141414]/70">মোট খরচ এন্ট্রি: {monthExpenses.length}টি</p>
            </div>
            <div className="text-base font-bold text-[#801414]">
              {formatCurrency(totalExpense)}
            </div>
          </div>

          <div className="bg-[#F4F3F0] border border-[#141414] overflow-hidden">
            <table className="w-full text-left text-xs tech-grid-table">
              <thead className="bg-[#EBEAE6] border-b border-[#141414] text-[#141414] font-bold">
                <tr>
                  <th className="px-3.5 py-2.5">ভাউচার নং ও তারিখ</th>
                  <th className="px-3.5 py-2.5">খরচের খাত</th>
                  <th className="px-3.5 py-2.5">প্রাপক ও বিবরণ</th>
                  <th className="px-3.5 py-2.5 text-right">খরচের পরিমাণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]/15 text-[#141414]">
                {monthExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-[#141414]/50">
                      এই মাসে কোন খরচের রেকর্ড নেই।
                    </td>
                  </tr>
                ) : (
                  monthExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-[#EBEAE6]">
                      <td className="px-3.5 py-2.5 font-bold text-[#141414]">
                        {e.expenseNumber} <span className="font-normal text-[11px] text-[#141414]/60">({e.date})</span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="px-1.5 py-0.2 border border-[#141414]/30 bg-[#DDDCD7] font-bold text-[#141414] text-[10px]">
                          {e.category}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="font-bold text-[#141414]">{e.paidTo}</div>
                        <div className="text-[#141414]/60 text-[11px]">{e.description}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-bold text-[#801414]">
                        -{formatCurrency(e.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: Due Report */}
      {activeReport === 'due' && (
        <div className="space-y-3 font-mono-data">
          <div className="bg-[#FCE8E8] p-3 border border-[#141414] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#801414]">
                সর্বমোট অপরিশোধিত ও বকেয়া ভাড়াটিয়া তালিকা (Due Report)
              </h3>
              <p className="text-[11px] text-[#801414]/80">
                মোট বকেয়া রয়েছে {dueTenantsList.length} জন ভাড়াটিয়ার কাছে
              </p>
            </div>
            <div className="text-base font-bold text-[#801414]">
              {formatCurrency(dueTenantsList.reduce((acc, t) => acc + t.due, 0))}
            </div>
          </div>

          <div className="bg-[#F4F3F0] border border-[#141414] overflow-hidden">
            <table className="w-full text-left text-xs tech-grid-table">
              <thead className="bg-[#EBEAE6] border-b border-[#141414] text-[#141414] font-bold uppercase">
                <tr>
                  <th className="px-3.5 py-2.5">ভাড়াটিয়ার নাম ও মোবাইল</th>
                  <th className="px-3.5 py-2.5">ইউনিট (Flat/Shop)</th>
                  <th className="px-3.5 py-2.5">মাসিক মূল ভাড়া</th>
                  <th className="px-3.5 py-2.5 text-right">মোট বিল</th>
                  <th className="px-3.5 py-2.5 text-right">মোট পরিশোধ</th>
                  <th className="px-3.5 py-2.5 text-right">বকেয়া পরিমাণ (Due)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]/15 text-[#141414]">
                {dueTenantsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#141414]/50">
                      কোন বকেয়া পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  dueTenantsList.map(({ tenant, totalB, totalP, due }) => (
                    <tr key={tenant.id} className="hover:bg-[#EBEAE6]">
                      <td className="px-3.5 py-2.5">
                        <div className="font-bold text-[#141414]">{tenant.name}</div>
                        <div className="text-[#141414]/60 text-[11px]">{tenant.phone}</div>
                      </td>
                      <td className="px-3.5 py-2.5 font-bold text-[#141414]">
                        {tenant.unitNumber} ({tenant.unitType.toUpperCase()})
                      </td>
                      <td className="px-3.5 py-2.5 text-[#141414]/80 font-medium">
                        {formatCurrency(tenant.monthlyRent)}
                      </td>
                      <td className="px-3.5 py-2.5 text-right text-[#141414]">{formatCurrency(totalB)}</td>
                      <td className="px-3.5 py-2.5 text-right text-[#14532D] font-bold">{formatCurrency(totalP)}</td>
                      <td className="px-3.5 py-2.5 text-right font-bold text-[#801414] text-xs">
                        {formatCurrency(due)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 5: Tenant Statement (Requirement 15) */}
      {activeReport === 'tenant_statement' && (
        <div className="space-y-3 font-mono-data">
          <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ভাড়াটিয়ার নাম বা ফ্ল্যাট দিয়ে খুঁজুন..."
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1 text-xs bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
              />
            </div>
            <p className="text-xs text-[#141414]/70">
              প্রতিটি ভাড়াটিয়ার জন্য এক ক্লিকে অফিশিয়াল স্টেটমেন্ট তৈরি করুন
            </p>
          </div>

          <div className="bg-[#F4F3F0] border border-[#141414] overflow-hidden">
            <table className="w-full text-left text-xs tech-grid-table">
              <thead className="bg-[#EBEAE6] border-b border-[#141414] text-[#141414] font-bold uppercase">
                <tr>
                  <th className="px-3.5 py-2.5">ভাড়াটিয়া ও ফোন</th>
                  <th className="px-3.5 py-2.5">ইউনিট</th>
                  <th className="px-3.5 py-2.5">বর্তমান মাসের বিল ({selectedMonth})</th>
                  <th className="px-3.5 py-2.5">পরিশোধ</th>
                  <th className="px-3.5 py-2.5">বকেয়া</th>
                  <th className="px-3.5 py-2.5 text-right">স্টেটমেন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]/15 text-[#141414]">
                {tenants
                  .filter(
                    (t) =>
                      t.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
                      t.unitNumber.toLowerCase().includes(tenantSearch.toLowerCase())
                  )
                  .map((t) => {
                    const bill = bills.find(
                      (b) => b.tenantId === t.id && b.month === selectedMonth && b.year === selectedYear
                    );
                    const bTotal = bill ? bill.totalAmount : t.monthlyRent;
                    const bPaid = bill ? bill.paidAmount : 0;
                    const bDue = bill ? bill.dueAmount : t.monthlyRent;

                    return (
                      <tr key={t.id} className="hover:bg-[#EBEAE6]">
                        <td className="px-3.5 py-2.5 font-bold text-[#141414]">
                          <div>{t.name}</div>
                          <div className="text-[11px] text-[#141414]/60 font-normal">{t.phone}</div>
                        </td>
                        <td className="px-3.5 py-2.5 font-bold text-[#141414]">{t.unitNumber}</td>
                        <td className="px-3.5 py-2.5 font-medium text-[#141414]">{formatCurrency(bTotal)}</td>
                        <td className="px-3.5 py-2.5 font-bold text-[#14532D]">{formatCurrency(bPaid)}</td>
                        <td className="px-3.5 py-2.5 font-bold text-[#801414]">{formatCurrency(bDue)}</td>
                        <td className="px-3.5 py-2.5 text-right">
                          <button
                            onClick={() =>
                              setSelectedStatementModal({
                                tenant: t,
                                month: selectedMonth,
                                year: selectedYear,
                              })
                            }
                            className="px-2.5 py-1 bg-[#EBEAE6] hover:bg-[#DDDCD7] border border-[#141414] text-[#141414] text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>স্টেটমেন্ট দেখুন</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 6: Yearly Report */}
      {activeReport === 'yearly' && (
        <div className="space-y-4 font-mono-data">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#EBEAE6] p-3 border border-[#141414]">
              <span className="text-xs font-bold text-[#141414]">
                {selectedYear} সালের মোট সংগৃহীত আয়
              </span>
              <div className="text-lg font-bold text-[#14532D] mt-1">
                {formatCurrency(yearlyTotalIncome)}
              </div>
            </div>
            <div className="bg-[#EBEAE6] p-3 border border-[#141414]">
              <span className="text-xs font-bold text-[#141414]">
                {selectedYear} সালের মোট পরিচালন ব্যয়
              </span>
              <div className="text-lg font-bold text-[#801414] mt-1">
                {formatCurrency(yearlyTotalExpense)}
              </div>
            </div>
            <div className="bg-[#141414] text-[#E4E3E0] p-3 border border-[#141414]">
              <span className="text-xs font-bold text-[#E4E3E0]/70">
                {selectedYear} সালের বাৎসরিক নিট লাভ (Net Profit)
              </span>
              <div className="text-lg font-bold text-white mt-1">
                {formatCurrency(yearlyNetProfit)}
              </div>
            </div>
          </div>

          {/* 12 Months Breakdown Chart */}
          <div className="bg-[#F4F3F0] p-4 border border-[#141414]">
            <h4 className="text-xs font-bold text-[#141414] mb-3">
              {selectedYear} সালের মাসভিত্তিক আয়, ব্যয় ও লাভের চার্ট
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyMonthsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDDCD7" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#141414' }} stroke="#141414" />
                  <YAxis tick={{ fontSize: 11, fill: '#141414' }} stroke="#141414" />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val))}
                    contentStyle={{ backgroundColor: '#F4F3F0', borderColor: '#141414', borderRadius: 0, fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="আয় (Income)" fill="#14532D" />
                  <Bar dataKey="expense" name="ব্যয় (Expense)" fill="#801414" />
                  <Bar dataKey="profit" name="মুনাফা (Profit)" fill="#141414" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
