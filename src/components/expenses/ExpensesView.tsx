import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory } from '../../types';
import {
  formatCurrency,
  MONTHS,
  MONTHS_BN,
  formatDateBn,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  DollarSign,
  PlusCircle,
  History,
  Search,
  Trash2,
  Calendar,
  Tag,
  Receipt,
  FileText,
  User,
  Shield,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string }[] = [
  { id: 'electricity', label: 'বিদ্যুৎ বিল (বিল্ডিং কমন/পাম্প)' },
  { id: 'generator', label: 'জেনারেটর ডিজেল / জ্বালানি' },
  { id: 'water_repair', label: 'পানির লাইন ও প্লাম্বিং মেরামত' },
  { id: 'security_salary', label: 'নিরাপত্তা কর্মী ও গার্ডের বেতন' },
  { id: 'cleaner_salary', label: 'ক্লিনার ও পরিচ্ছন্নতাকর্মীর বেতন' },
  { id: 'lift_maintenance', label: 'লিফট সার্ভিসিং ও রক্ষণাবেক্ষণ' },
  { id: 'management', label: 'ম্যানেজমেন্ট ও স্টাফ খরচ' },
  { id: 'other', label: 'অন্যান্য জরুরি খরচ' },
];

interface ExpensesViewProps {
  initialSubTab?: 'add' | 'history';
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ initialSubTab = 'history' }) => {
  const {
    expenses,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    addExpense,
    deleteExpense,
    currentUser,
  } = useApp();

  const isOwner = currentUser.role === 'owner';

  const [subTab, setSubTab] = useState<'add' | 'history'>(initialSubTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('electricity');
  const [amount, setAmount] = useState<number>(15000);
  const [date, setDate] = useState<string>('2026-08-28');
  const [description, setDescription] = useState<string>('');
  const [paidTo, setPaidTo] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paidTo.trim() || Number(amount) <= 0) {
      alert('অনুগ্রহ করে খরচের প্রাপক ও সঠিক পরিমাণ দিন।');
      return;
    }

    addExpense({
      category,
      amount: Number(amount),
      date,
      month: selectedMonth,
      year: selectedYear,
      description: description.trim() || EXPENSE_CATEGORIES.find((c) => c.id === category)?.label || '',
      paidTo: paidTo.trim(),
    });

    confetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.6 },
    });

    setSubTab('history');
  };

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchesMonth = e.month === selectedMonth && e.year === selectedYear;
    const matchesSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesMonth && matchesSearch && matchesCategory;
  });

  const totalExpenseInList = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#141414]" />
            <span>ভবন ও প্রপার্টি ব্যয় ব্যবস্থাপনা (Expense Management)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            বিদ্যুৎ, জেনারেটর ডিজেল, সিকিউরিটি, লিফট মেরামত ও অন্যান্য খরচের হিসাব
          </p>
        </div>

        {/* Global Month/Year selector */}
        <div className="flex items-center gap-2 font-mono-data">
          <div className="flex items-center gap-1 bg-[#F4F3F0] px-2.5 py-1 border border-[#141414] text-xs">
            <span className="font-bold text-[#141414]/60">মাস:</span>
            <select
              aria-label="ব্যয় মাস নির্বাচন"
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
              aria-label="ব্যয় বছর নির্বাচন"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="font-bold text-[#141414] outline-none cursor-pointer bg-transparent"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center border-b border-[#141414]/20 gap-1 overflow-x-auto pb-0.5 font-mono-data">
        <button
          onClick={() => setSubTab('history')}
          className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            subTab === 'history'
              ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
              : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>
            খরচের ইতিহাস ({MONTHS_BN[selectedMonth]} {selectedYear})
          </span>
        </button>

        <button
          onClick={() => setSubTab('add')}
          className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            subTab === 'add'
              ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
              : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>নতুন ব্যয় এন্ট্রি করুন (Add Expense)</span>
        </button>
      </div>

      {/* Tab: Add Expense */}
      {subTab === 'add' && (
        <div className="max-w-xl mx-auto bg-[#F4F3F0] p-5 border border-[#141414] font-mono-data">
          <h3 className="text-sm font-serif-heading font-bold text-[#141414] mb-3 pb-2 border-b border-[#141414]/15 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#141414]" />
            <span>নতুন খরচের ভাউচার এন্ট্রি</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-[#141414] mb-1">খরচের খাত (Category) *</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-[#141414]/40 font-bold text-[#141414] text-xs outline-none bg-[#EBEAE6] cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#141414] mb-1">টাকার পরিমাণ (Amount) ৳ *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#141414] font-bold text-[#801414] text-base outline-none bg-[#EBEAE6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#141414] mb-1">তারিখ (Date) *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#141414]/40 font-medium outline-none bg-[#EBEAE6]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#141414] mb-1">প্রাপক / যাকে পরিশোধ করা হলো (Paid To) *</label>
              <input
                type="text"
                required
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="যেমন: ডেসকো অফিস / মোশারফ সিকিউরিটি এজেন্সি / জ্বালানি পাম্প"
                className="w-full px-2.5 py-1.5 border border-[#141414]/40 font-bold text-[#141414] outline-none bg-[#EBEAE6]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#141414] mb-1">খরচের বিস্তারিত বিবরণ (Description)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="যেমন: আগস্ট মাসের জেনারেটরের জন্য ২২০ লিটার ডিজেল ক্রয় করা হলো"
                className="w-full px-2.5 py-1.5 border border-[#141414]/40 font-medium outline-none bg-[#EBEAE6]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] border border-[#141414] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>ব্যয় সংরক্ষণ করুন ও ক্যাশ বুকে যোগ করুন</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Expense History */}
      {subTab === 'history' && (
        <div className="space-y-3 font-mono-data">
          {/* Top Search & Stats */}
          <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ভাউচার নং, প্রাপক বা বিবরণ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1 text-xs bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                aria-label="খরচের খাত ফিল্টার"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-[#141414]/30 bg-[#EBEAE6] font-bold outline-none cursor-pointer"
              >
                <option value="all">সকল খরচের খাত</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              <div className="text-xs font-bold text-[#801414] bg-[#FCE8E8] px-2.5 py-1 border border-[#141414] whitespace-nowrap">
                মোট ব্যয়: {formatCurrency(totalExpenseInList)}
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-[#F4F3F0] border border-[#141414] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs tech-grid-table">
                <thead className="bg-[#EBEAE6] border-b border-[#141414] text-[#141414] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5">ভাউচার নং ও তারিখ</th>
                    <th className="px-3.5 py-2.5">খরচের খাত (Category)</th>
                    <th className="px-3.5 py-2.5">প্রাপক (Paid To)</th>
                    <th className="px-3.5 py-2.5">বিবরণ (Description)</th>
                    <th className="px-3.5 py-2.5">টাকার পরিমাণ</th>
                    <th className="px-3.5 py-2.5">এন্ট্রি প্রদানকারী</th>
                    <th className="px-3.5 py-2.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/15 text-[#141414]">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-[#141414]/50">
                        এই মাসে কোন খরচের রেকর্ড নেই।
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => {
                      const catObj = EXPENSE_CATEGORIES.find((c) => c.id === exp.category);
                      return (
                        <tr key={exp.id} className="hover:bg-[#EBEAE6] transition-colors">
                          <td className="px-3.5 py-2.5">
                            <div className="font-bold text-[#141414]">{exp.expenseNumber}</div>
                            <div className="text-[11px] text-[#141414]/60">{exp.date}</div>
                          </td>

                          <td className="px-3.5 py-2.5">
                            <span className="inline-block px-1.5 py-0.2 border text-[10px] font-bold bg-[#DDDCD7] border-[#141414]/30 text-[#141414]">
                              {catObj ? catObj.label : exp.category}
                            </span>
                          </td>

                          <td className="px-3.5 py-2.5 font-bold text-[#141414]">
                            {exp.paidTo}
                          </td>

                          <td className="px-3.5 py-2.5 text-[#141414]/80 max-w-xs truncate">
                            {exp.description}
                          </td>

                          <td className="px-3.5 py-2.5 font-bold text-[#801414] text-xs">
                            -{formatCurrency(exp.amount)}
                          </td>

                          <td className="px-3.5 py-2.5 text-[#141414]/70 font-medium">
                            {exp.paidBy}
                          </td>

                          <td className="px-3.5 py-2.5 text-right">
                            {isOwner && (
                              <button
                                onClick={() => {
                                  if (confirm(`আপনি কি ব্যয় ${exp.expenseNumber} মুছে ফেলতে চান?`)) {
                                    deleteExpense(exp.id);
                                  }
                                }}
                                className="p-1 text-[#801414] hover:bg-[#FCE8E8] border border-transparent hover:border-[#801414]/30 cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
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
      )}
    </div>
  );
};
