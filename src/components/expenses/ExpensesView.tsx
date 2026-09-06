import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import {
  formatCurrency,
  MONTHS,
  MONTHS_BN,
  formatDateBn,
  parseNumber,
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
  CheckCircle2,
  Printer,
  Sparkles,
  CreditCard,
  Eye,
  X,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string; icon?: string }[] = [
  { id: 'electricity', label: 'বিদ্যুৎ বিল (বিল্ডিং কমন/পাম্প)' },
  { id: 'generator', label: 'জেনারেটর ডিজেল / জ্বালানি' },
  { id: 'water_repair', label: 'পানির লাইন ও প্লাম্বিং মেরামত' },
  { id: 'security_salary', label: 'নিরাপত্তা কর্মী ও গার্ডের বেতন' },
  { id: 'cleaner_salary', label: 'ক্লিনার ও পরিচ্ছন্নতাকর্মীর বেতন' },
  { id: 'lift_maintenance', label: 'লিফট সার্ভিসিং ও রক্ষণাবেক্ষণ' },
  { id: 'management', label: 'ম্যানেজমেন্ট ও অফিস খরচ' },
  { id: 'other', label: 'অন্যান্য জরুরি খরচ' },
];

const PRESET_EXPENSES = [
  { title: 'জেনারেটর ডিজেল ক্রয়', category: 'generator' as ExpenseCategory, amount: 9200, paidTo: 'পদ্মা ওয়েল ফিলিং স্টেশন' },
  { title: 'কমন স্পেস বিদ্যুৎ বিল', category: 'electricity' as ExpenseCategory, amount: 18500, paidTo: 'ডেসকো (DESCO)' },
  { title: 'নিরাপত্তা গার্ড মাসিক বেতন', category: 'security_salary' as ExpenseCategory, amount: 36000, paidTo: 'সিকিউরিটি সার্ভিস এজেন্সি' },
  { title: 'ক্লিনারদের মাসিক মজুরি', category: 'cleaner_salary' as ExpenseCategory, amount: 28000, paidTo: 'পরিচ্ছন্নতা টিম' },
  { title: 'পানির পাম্প ও মোটর সার্ভিসিং', category: 'water_repair' as ExpenseCategory, amount: 14500, paidTo: 'ইঞ্জিনিয়ারিং ওয়ার্কস' },
  { title: 'লিফট নিয়মিত রক্ষণাবেক্ষণ', category: 'lift_maintenance' as ExpenseCategory, amount: 12000, paidTo: 'লিফট সার্ভিসিং কোম্পানি' },
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
    settings,
  } = useApp();

  const isOwner = currentUser.role === 'owner';

  const [subTab, setSubTab] = useState<'add' | 'history'>(initialSubTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAllTime, setShowAllTime] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedVoucherForModal, setSelectedVoucherForModal] = useState<Expense | null>(null);

  // Sync tab when prop changes (e.g. from sidebar navigation)
  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('electricity');
  const [title, setTitle] = useState<string>('বিদ্যুৎ বিল (বিল্ডিং কমন/পাম্প)');
  const [amount, setAmount] = useState<string>('15000');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [paidTo, setPaidTo] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidBy, setPaidBy] = useState<string>(currentUser.name || 'শোভা (SHOVA)');

  const handleCategoryChange = (newCat: ExpenseCategory) => {
    setCategory(newCat);
    const catObj = EXPENSE_CATEGORIES.find((c) => c.id === newCat);
    if (catObj && (!title || EXPENSE_CATEGORIES.some((c) => c.label === title))) {
      setTitle(catObj.label);
    }
  };

  const applyPreset = (preset: typeof PRESET_EXPENSES[0]) => {
    setCategory(preset.category);
    setTitle(preset.title);
    setAmount(String(preset.amount));
    setPaidTo(preset.paidTo);
    setDescription(`${preset.title} বাবদ পরিশোধ`);
  };

  const parsedNumericAmount = parseNumber(amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseNumber(amount);
    if (numAmount <= 0) {
      alert('অনুগ্রহ করে খরচের সঠিক টাকার পরিমাণ লিখুন (যেমন: ১৫০০০ বা 15000)।');
      return;
    }

    const catObj = EXPENSE_CATEGORIES.find((c) => c.id === category);
    const finalPaidTo = paidTo.trim() || catObj?.label || 'সার্ভিস প্রোভাইডার';
    const finalTitle = title.trim() || catObj?.label || 'প্রপার্টি পরিচালন ব্যয়';

    // Determine month and year from date
    let expMonth = selectedMonth;
    let expYear = selectedYear;
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const mIdx = parseInt(parts[1], 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          expMonth = MONTHS[mIdx];
        }
        expYear = parseInt(parts[0], 10);
      }
    }

    const newExp = addExpense({
      category,
      title: finalTitle,
      amount: numAmount,
      date: date || new Date().toISOString().split('T')[0],
      month: expMonth,
      year: expYear,
      paymentMethod,
      paidTo: finalPaidTo,
      paidBy: paidBy.trim() || currentUser.name,
      description: description.trim() || `${finalTitle} বাবদ পরিশোধ`,
    });

    // Make sure month & year matches so it shows up in history table
    setSelectedMonth(expMonth);
    setSelectedYear(expYear);

    setSuccessMessage(`✓ খরচের ভাউচার ${newExp.voucherNumber} সফলভাবে এন্ট্রি হয়েছে (৳${numAmount.toLocaleString()})।`);

    // Reset form inputs for next entry
    setPaidTo('');
    setDescription('');
    setAmount('');

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (_) {}
  };

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchesMonth = showAllTime || (e.month === selectedMonth && e.year === selectedYear);
    const vNum = e.voucherNumber || (e as any).expenseNumber || '';
    const desc = e.description || e.title || '';
    const pTo = e.paidTo || '';
    const matchesSearch =
      desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vNum.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesMonth && matchesSearch && matchesCategory;
  });

  const totalExpenseInList = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Recent 5 expenses
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#801414]" />
            <span>ভবন ও প্রপার্টি ব্যয় ব্যবস্থাপনা (Expense Management)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            বিদ্যুৎ, জেনারেটর ডিজেল, সিকিউরিটি, লিফট মেরামত ও অন্যান্য পরিচালন খরচের হিসাব
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

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-data font-bold text-[#141414] bg-[#DDDCD7] hover:bg-[#C8C7C2] border border-[#141414] transition-colors no-print cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট ভাউচার শিট</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-[#E2EFE7] border-2 border-[#144A29] p-3.5 text-xs font-mono-data text-[#144A29] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#144A29] flex-shrink-0" />
            <span className="font-bold text-sm">{successMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubTab('history')}
              className="px-3 py-1 bg-[#144A29] text-white font-bold text-xs hover:bg-[#0E351D] transition-colors cursor-pointer"
            >
              খরচের তালিকা দেখুন →
            </button>
            <button
              onClick={() => setSuccessMessage(null)}
              className="p-1 hover:bg-[#144A29]/10 text-[#144A29] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center border-b border-[#141414]/20 gap-1 overflow-x-auto pb-0.5 font-mono-data">
        <button
          onClick={() => setSubTab('add')}
          className={`px-3.5 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === 'add'
              ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
              : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#801414]" />
          <span>নতুন ব্যয় এন্ট্রি ফরম (Add Expense)</span>
        </button>

        <button
          onClick={() => setSubTab('history')}
          className={`px-3.5 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === 'history'
              ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
              : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>
            খরচের ইতিহাস ({showAllTime ? 'সব সময়' : `${MONTHS_BN[selectedMonth]} ${selectedYear}`})
          </span>
        </button>
      </div>

      {/* Tab: Add Expense */}
      {subTab === 'add' && (
        <div className="space-y-4 font-mono-data">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Form */}
            <div className="lg:col-span-2 bg-[#F4F3F0] p-5 border border-[#141414]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#141414]/15">
                <h3 className="text-sm font-serif-heading font-bold text-[#141414] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#801414]" />
                  <span>নতুন খরচের ভাউচার এন্ট্রি ফরম</span>
                </h3>
                <span className="text-[11px] bg-[#DDDCD7] px-2 py-0.5 border border-[#141414]/30 font-bold">
                  ক্যাশ বুক ও ভাউচার সমন্বিত
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="mb-4 bg-[#EBEAE6] p-2.5 border border-[#141414]/30">
                <div className="text-[11px] font-bold text-[#141414]/70 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#801414]" />
                  <span>দ্রুত খরচের প্রিসেট বাটন (Quick Presets):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_EXPENSES.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="px-2 py-1 text-[11px] bg-[#F4F3F0] hover:bg-[#DDDCD7] border border-[#141414]/40 text-[#141414] font-medium transition-colors cursor-pointer"
                    >
                      + {p.title} (৳{p.amount.toLocaleString()})
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#141414] mb-1">
                      খরচের খাত (Category) <span className="text-[#801414]">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e: any) => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-[#141414]/40 font-bold text-[#141414] text-xs outline-none bg-[#EBEAE6] cursor-pointer"
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#141414] mb-1">
                      খরচের শিরোনাম (Title) <span className="text-[#801414]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="যেমন: জেনারেটর ডিজেল ক্রয় / পানির মোটর মেরামত"
                      className="w-full px-3 py-2 border border-[#141414]/40 font-bold text-[#141414] outline-none bg-[#EBEAE6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#141414] mb-1">
                      টাকার পরিমাণ (Amount ৳) <span className="text-[#801414]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="যেমন: 15000 বা ১৫০০০"
                        className="w-full px-3 py-2 border border-[#141414] font-bold text-[#801414] text-base outline-none bg-[#EBEAE6]"
                      />
                      {parsedNumericAmount > 0 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#144A29] pointer-events-none">
                          {formatCurrency(parsedNumericAmount)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#141414] mb-1">
                      খরচের তারিখ (Date) <span className="text-[#801414]">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-2.5 py-2 border border-[#141414]/40 font-medium outline-none bg-[#EBEAE6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#141414] mb-1">
                      প্রাপক / যাকে পরিশোধ করা হলো (Paid To) <span className="text-[#801414]">*</span>
                    </label>
                    <input
                      type="text"
                      value={paidTo}
                      onChange={(e) => setPaidTo(e.target.value)}
                      placeholder="যেমন: ডেসকো অফিস / মোশারফ সিকিউরিটি / পাম্প"
                      className="w-full px-2.5 py-2 border border-[#141414]/40 font-bold text-[#141414] outline-none bg-[#EBEAE6]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#141414] mb-1">
                      পরিশোধের মাধ্যম (Payment Method) <span className="text-[#801414]">*</span>
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full px-2.5 py-2 border border-[#141414]/40 font-bold text-[#141414] outline-none bg-[#EBEAE6] cursor-pointer"
                    >
                      <option value="cash">নগদ ক্যাশ (Cash)</option>
                      <option value="bank">ব্যাংক চেক / ট্রান্সফার (Bank / Cheque)</option>
                      <option value="mobile_banking">মোবাইল ব্যাংকিং (bKash / Nagad)</option>
                      <option value="other">অন্যান্য (Other)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#141414] mb-1">
                    এন্ট্রি প্রদানকারী / অনুমোদনে (Paid/Recorded By)
                  </label>
                  <input
                    type="text"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    placeholder="যেমন: শোভা (SHOVA) / মোঃ শওকত কামাল"
                    className="w-full px-2.5 py-1.5 border border-[#141414]/40 font-medium outline-none bg-[#EBEAE6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#141414] mb-1">খরচের বিস্তারিত বিবরণ (Description/Notes)</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="যেমন: আগস্ট ২০২৬ মাসের কমন এরিয়ার লিফট ও ওয়াটার পাম্পের বিদ্যুৎ বিল পরিশোধ করা হলো"
                    className="w-full px-2.5 py-1.5 border border-[#141414]/40 font-medium outline-none bg-[#EBEAE6]"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-bold text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] border border-[#141414] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>খরচ সংরক্ষণ করুন ও ক্যাশ বুকে যুক্ত করুন (Save Expense)</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Real-time Voucher Summary Preview */}
            <div className="bg-[#F4F3F0] p-5 border border-[#141414] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-[#141414] border-b border-[#141414]/20 pb-2 mb-3 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#141414]" />
                  <span>ভাউচার প্রিভিউ (Voucher Preview)</span>
                </div>

                <div className="bg-[#EBEAE6] p-4 border border-[#141414]/30 space-y-2.5 text-xs">
                  <div className="text-center pb-2 border-b border-[#141414]/20">
                    <div className="font-bold text-[#141414]">{settings.propertyNameBn || 'তুলতুল ভিলা'}</div>
                    <div className="text-[10px] text-[#141414]/60">ব্যয় ভাউচার (Expense Voucher)</div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#141414]/60">তারিখ:</span>
                    <span className="font-bold">{date || '---'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#141414]/60">খাত:</span>
                    <span className="font-bold text-right truncate max-w-[150px]">
                      {EXPENSE_CATEGORIES.find((c) => c.id === category)?.label || category}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#141414]/60">প্রাপক:</span>
                    <span className="font-bold text-right truncate max-w-[150px]">
                      {paidTo || EXPENSE_CATEGORIES.find((c) => c.id === category)?.label || '---'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#141414]/60">পরিশোধ মাধ্যম:</span>
                    <span className="font-bold">
                      {paymentMethod === 'cash'
                        ? 'নগদ ক্যাশ'
                        : paymentMethod === 'bank'
                        ? 'ব্যাংক ট্রান্সফার'
                        : paymentMethod === 'mobile_banking'
                        ? 'মোবাইল ব্যাংকিং'
                        : 'অন্যান্য'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#141414]/20 flex justify-between items-center">
                    <span className="font-bold text-[#141414]">মোট পরিমাণ:</span>
                    <span className="text-base font-bold text-[#801414]">
                      {parsedNumericAmount > 0 ? formatCurrency(parsedNumericAmount) : '৳ ০'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-[#141414]/70 bg-[#DDDCD7] p-2.5 border border-[#141414]/30">
                💡 <strong>টিপস:</strong> খরচ যোগ করার সাথে সাথে তা স্বয়ংক্রিয়ভাবে ক্যাশ বুক ও প্রফিট অ্যান্ড লস রিপোর্টে সমন্বিত হয়।
              </div>
            </div>
          </div>

          {/* Live Recent Expenses Table Directly Below the Form */}
          <div className="bg-[#F4F3F0] p-4 border border-[#141414]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#141414]/20">
              <h4 className="text-xs font-bold text-[#141414] uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#141414]" />
                <span>সর্বশেষ সংরক্ষিত ব্যয়সমূহ (Recent Expenses - {expenses.length} টি)</span>
              </h4>
              <button
                onClick={() => setSubTab('history')}
                className="text-xs font-bold text-[#801414] hover:underline cursor-pointer"
              >
                সম্পূর্ণ তালিকা দেখুন →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs tech-grid-table">
                <thead className="bg-[#EBEAE6] border-b border-[#141414] text-[#141414] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">ভাউচার নং</th>
                    <th className="px-3 py-2">তারিখ</th>
                    <th className="px-3 py-2">খরচের খাত</th>
                    <th className="px-3 py-2">প্রাপক</th>
                    <th className="px-3 py-2">পরিমাণ</th>
                    <th className="px-3 py-2 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/15">
                  {recentExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-[#141414]/50">
                        এখনো কোনো খরচ যুক্ত করা হয়নি।
                      </td>
                    </tr>
                  ) : (
                    recentExpenses.map((exp) => {
                      const catObj = EXPENSE_CATEGORIES.find((c) => c.id === exp.category);
                      const voucherCode = exp.voucherNumber || (exp as any).expenseNumber || `EXP-${exp.id}`;

                      return (
                        <tr key={exp.id} className="hover:bg-[#EBEAE6]">
                          <td className="px-3 py-2 font-bold text-[#141414]">{voucherCode}</td>
                          <td className="px-3 py-2 text-[#141414]/70">{exp.date}</td>
                          <td className="px-3 py-2">
                            <span className="px-1.5 py-0.2 bg-[#DDDCD7] border border-[#141414]/20 text-[10px] font-bold">
                              {catObj ? catObj.label : exp.category}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-bold text-[#141414]">{exp.paidTo || exp.title}</td>
                          <td className="px-3 py-2 font-bold text-[#801414]">-{formatCurrency(exp.amount)}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => setSelectedVoucherForModal(exp)}
                              className="px-2 py-0.5 bg-[#DDDCD7] hover:bg-[#C8C7C2] text-[#141414] border border-[#141414]/30 text-[11px] font-bold cursor-pointer"
                            >
                              ভাউচার
                            </button>
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

      {/* Tab: Expense History */}
      {subTab === 'history' && (
        <div className="space-y-3 font-mono-data">
          {/* Top Search & Stats */}
          <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ভাউচার নং, প্রাপক বা বিবরণ দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Toggle: Selected Month vs All Time */}
              <button
                onClick={() => setShowAllTime(!showAllTime)}
                className={`px-2.5 py-1 text-xs border font-bold flex items-center gap-1 cursor-pointer ${
                  showAllTime
                    ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
                    : 'bg-[#EBEAE6] text-[#141414] border-[#141414]/40 hover:bg-[#DDDCD7]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showAllTime ? 'সব মাসের খরচ (All Time)' : `${MONTHS_BN[selectedMonth]} ${selectedYear}`}</span>
              </button>

              <select
                aria-label="খরচের খাত ফিল্টার"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-[#141414]/30 bg-[#EBEAE6] font-bold outline-none cursor-pointer"
              >
                <option value="all">সকল খাতের ব্যয় ({expenses.length})</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              <div className="text-xs font-bold text-[#801414] bg-[#FCE8E8] px-2.5 py-1.5 border border-[#141414] whitespace-nowrap">
                মোট ব্যয়: {formatCurrency(totalExpenseInList)}
              </div>

              <button
                onClick={() => setSubTab('add')}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#141414] text-[#E4E3E0] font-bold text-xs hover:bg-[#2A2A28] border border-[#141414] cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>নতুন খরচ এন্ট্রি</span>
              </button>
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
                    <th className="px-3.5 py-2.5">পরিশোধের ধরন</th>
                    <th className="px-3.5 py-2.5">টাকার পরিমাণ</th>
                    <th className="px-3.5 py-2.5">এন্ট্রি প্রদানকারী</th>
                    <th className="px-3.5 py-2.5 text-right no-print">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/15 text-[#141414]">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-[#141414]/50">
                        {showAllTime
                          ? 'কোনো খরচের রেকর্ড পাওয়া যায়নি।'
                          : `${MONTHS_BN[selectedMonth]} ${selectedYear} মাসে কোনো খরচের রেকর্ড নেই।`}
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <button
                            onClick={() => setShowAllTime(true)}
                            className="px-2.5 py-1 bg-[#DDDCD7] text-[#141414] font-bold text-xs cursor-pointer"
                          >
                            সব মাসের খরচ দেখুন
                          </button>
                          <button
                            onClick={() => setSubTab('add')}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#141414] text-[#E4E3E0] font-bold text-xs cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>প্রথম খরচ এন্ট্রি করুন</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => {
                      const catObj = EXPENSE_CATEGORIES.find((c) => c.id === exp.category);
                      const voucherCode = exp.voucherNumber || (exp as any).expenseNumber || `EXP-${exp.id}`;

                      return (
                        <tr key={exp.id} className="hover:bg-[#EBEAE6] transition-colors">
                          <td className="px-3.5 py-2.5">
                            <div className="font-bold text-[#141414]">{voucherCode}</div>
                            <div className="text-[11px] text-[#141414]/60">{exp.date}</div>
                          </td>

                          <td className="px-3.5 py-2.5">
                            <span className="inline-block px-1.5 py-0.2 border text-[10px] font-bold bg-[#DDDCD7] border-[#141414]/30 text-[#141414]">
                              {catObj ? catObj.label : exp.category}
                            </span>
                          </td>

                          <td className="px-3.5 py-2.5 font-bold text-[#141414]">
                            {exp.paidTo || exp.title || '---'}
                          </td>

                          <td className="px-3.5 py-2.5 text-[#141414]/80 max-w-xs truncate">
                            {exp.title || exp.description || '---'}
                          </td>

                          <td className="px-3.5 py-2.5 text-[11px] text-[#141414]/70">
                            {exp.paymentMethod === 'bank'
                              ? 'ব্যাংক'
                              : exp.paymentMethod === 'mobile_banking'
                              ? 'মোবাইল'
                              : 'নগদ'}
                          </td>

                          <td className="px-3.5 py-2.5 font-bold text-[#801414] text-xs whitespace-nowrap">
                            -{formatCurrency(exp.amount)}
                          </td>

                          <td className="px-3.5 py-2.5 text-[#141414]/70 font-medium text-[11px]">
                            {exp.paidBy || '---'}
                          </td>

                          <td className="px-3.5 py-2.5 text-right no-print space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedVoucherForModal(exp)}
                              className="p-1 text-[#141414] hover:bg-[#DDDCD7] border border-[#141414]/30 cursor-pointer"
                              title="ভাউচার দেখুন ও প্রিন্ট করুন"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {isOwner && (
                              <button
                                onClick={() => {
                                  if (confirm(`আপনি কি ব্যয় ভাউচার ${voucherCode} মুছে ফেলতে চান?`)) {
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

      {/* Printable Expense Voucher Modal */}
      {selectedVoucherForModal && (
        <div className="fixed inset-0 z-50 bg-[#141414]/60 flex items-center justify-center p-4">
          <div className="bg-[#F4F3F0] border-2 border-[#141414] max-w-md w-full p-5 font-mono-data space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#141414]/20 no-print">
              <h3 className="font-bold text-[#141414] flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#801414]" />
                <span>ব্যয় পরিশোধ ভাউচার (Expense Voucher)</span>
              </h3>
              <button
                onClick={() => setSelectedVoucherForModal(null)}
                className="p-1 hover:bg-[#DDDCD7] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#EBEAE6] p-4 border border-[#141414] space-y-3 text-xs">
              <div className="text-center pb-2 border-b border-[#141414]/20">
                <div className="font-serif-heading font-bold text-base text-[#141414]">
                  {settings.propertyNameBn || 'তুলতুল ভিলা'}
                </div>
                <div className="text-[11px] text-[#141414]/60">{settings.address || 'উত্তরা, ঢাকা'}</div>
                <div className="inline-block mt-1 px-2 py-0.5 bg-[#DDDCD7] border border-[#141414]/30 font-bold text-[10px]">
                  ব্যয় ভাউচার নং: {selectedVoucherForModal.voucherNumber || (selectedVoucherForModal as any).expenseNumber || `EXP-${selectedVoucherForModal.id}`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#141414]/60 block text-[10px]">তারিখ:</span>
                  <span className="font-bold">{selectedVoucherForModal.date}</span>
                </div>
                <div>
                  <span className="text-[#141414]/60 block text-[10px]">মাস/বছর:</span>
                  <span className="font-bold">{MONTHS_BN[selectedVoucherForModal.month]} {selectedVoucherForModal.year}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#141414]/60 block text-[10px]">খরচের খাত:</span>
                  <span className="font-bold">
                    {EXPENSE_CATEGORIES.find((c) => c.id === selectedVoucherForModal.category)?.label || selectedVoucherForModal.category}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#141414]/60 block text-[10px]">প্রাপক:</span>
                  <span className="font-bold text-[#141414]">{selectedVoucherForModal.paidTo || selectedVoucherForModal.title}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#141414]/60 block text-[10px]">বিবরণ:</span>
                  <span className="text-[#141414]/80">{selectedVoucherForModal.description || selectedVoucherForModal.title || '---'}</span>
                </div>
                <div>
                  <span className="text-[#141414]/60 block text-[10px]">পরিশোধের ধরন:</span>
                  <span className="font-bold">{selectedVoucherForModal.paymentMethod === 'cash' ? 'নগদ ক্যাশ' : selectedVoucherForModal.paymentMethod === 'bank' ? 'ব্যাংক ট্রান্সফার' : 'অন্যান্য'}</span>
                </div>
                <div>
                  <span className="text-[#141414]/60 block text-[10px]">অনুমোদনে:</span>
                  <span className="font-bold">{selectedVoucherForModal.paidBy || 'ম্যানেজার'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#141414] flex justify-between items-center">
                <span className="font-bold text-[#141414]">পরিশোধিত টাকার পরিমাণ:</span>
                <span className="text-lg font-bold text-[#801414]">
                  {formatCurrency(selectedVoucherForModal.amount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-[#141414] text-[#E4E3E0] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট ভাউচার</span>
              </button>
              <button
                onClick={() => setSelectedVoucherForModal(null)}
                className="px-3 py-1.5 bg-[#DDDCD7] text-[#141414] font-bold text-xs border border-[#141414]/30 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
