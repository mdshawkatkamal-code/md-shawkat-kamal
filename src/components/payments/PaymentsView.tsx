import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Payment, PaymentMethod, Bill } from '../../types';
import {
  formatCurrency,
  MONTHS,
  MONTHS_BN,
  formatDateBn,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  CreditCard,
  PlusCircle,
  History,
  Receipt,
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
  Trash2,
  Mail,
  Send,
  Building2,
  Calendar,
  User,
  DollarSign,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentsViewProps {
  initialSubTab?: 'add' | 'history' | 'receipts';
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ initialSubTab = 'add' }) => {
  const {
    tenants,
    bills,
    payments,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    recordPayment,
    deletePayment,
    setSelectedReceiptModal,
    currentUser,
  } = useApp();

  const isOwner = currentUser.role === 'owner';

  const [subTab, setSubTab] = useState<'add' | 'history' | 'receipts'>(initialSubTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Form State
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenants[0]?.id || '');
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(20000);
  const [paymentDate, setPaymentDate] = useState<string>('2026-08-29');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Selected Tenant object
  const currentTenant = tenants.find((t) => t.id === selectedTenantId);

  // Unpaid/Partial bills for the selected tenant
  const tenantBills = bills.filter(
    (b) => b.tenantId === selectedTenantId && (b.dueAmount > 0 || b.status !== 'paid')
  );

  // When selected tenant changes, auto-select their latest due bill or calculate default amount
  useEffect(() => {
    if (tenantBills.length > 0) {
      const bill = tenantBills[0];
      setSelectedBillId(bill.id);
      setPaymentAmount(bill.dueAmount || bill.totalAmount);
    } else {
      setSelectedBillId('');
      if (currentTenant) {
        setPaymentAmount(currentTenant.monthlyRent);
      }
    }
  }, [selectedTenantId, bills]);

  // Selected Bill object
  const currentBill = bills.find((b) => b.id === selectedBillId);

  // Calculated Preview
  const billTotal = currentBill ? currentBill.totalAmount : paymentAmount;
  const billPreviouslyPaid = currentBill ? currentBill.paidAmount : 0;
  const payingNow = Number(paymentAmount) || 0;
  const remainingDue = Math.max(0, (currentBill ? currentBill.dueAmount : paymentAmount) - payingNow);
  const nextStatus = remainingDue <= 0 ? 'paid' : 'partial';

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || payingNow <= 0) {
      alert('অনুগ্রহ করে সঠিক পরিমাণ ও ভাড়াটিয়া নির্বাচন করুন।');
      return;
    }

    const createdPayment = recordPayment({
      tenantId: currentTenant.id,
      unitType: currentTenant.unitType,
      unitId: currentTenant.unitId,
      unitNumber: currentTenant.unitNumber,
      month: currentBill ? currentBill.month : selectedMonth,
      year: currentBill ? currentBill.year : selectedYear,
      billId: selectedBillId || undefined,
      paymentDate,
      amount: payingNow,
      paymentMethod,
      reference: reference.trim() || undefined,
      bankName: bankName.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    confetti({
      particleCount: 70,
      spread: 50,
      origin: { y: 0.6 },
    });

    // Auto open receipt modal for immediate print/email
    setSelectedReceiptModal(createdPayment);
    setSubTab('history');
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchesMonth = p.month === selectedMonth && p.year === selectedYear;
    const matchesSearch =
      p.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
    return matchesMonth && matchesSearch && matchesMethod;
  });

  const totalCollectedInList = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#141414]" />
            <span>ভাড়া ও বিল আদায় (Payments &amp; Receipts)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            ভাড়া ও ইউটিলিটি বিলের পেমেন্ট এন্ট্রি, আংশিক পরিশোধ এবং অটো মানি রিসিট জেনারেশন
          </p>
        </div>

        {/* Global Month/Year selector */}
        <div className="flex items-center gap-2 font-mono-data">
          <div className="flex items-center gap-1 bg-[#F4F3F0] px-2.5 py-1 border border-[#141414] text-xs">
            <span className="font-bold text-[#141414]/60">মাস:</span>
            <select
              aria-label="পেমেন্ট মাস নির্বাচন"
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
              aria-label="পেমেন্ট বছর নির্বাচন"
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

      {/* Sub Tabs: Add Payment | Payment History | Receipts */}
      <div className="flex items-center border-b border-[#141414]/20 gap-1 overflow-x-auto pb-0.5 font-mono-data">
        <button
          onClick={() => setSubTab('add')}
          className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            subTab === 'add'
              ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
              : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>পেমেন্ট গ্রহণ (Add Payment Entry)</span>
        </button>

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
            পেমেন্টের ইতিহাস ({MONTHS_BN[selectedMonth]} {selectedYear})
          </span>
        </button>

        <button
          onClick={() => setSubTab('receipts')}
          className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            subTab === 'receipts'
              ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
              : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>মানি রিসিটসমূহ (Receipts)</span>
        </button>
      </div>

      {/* Tab 1: Add Payment Form (Exact Requirement 6 & 13) */}
      {subTab === 'add' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono-data">
          {/* Form Column (2 spans) */}
          <div className="lg:col-span-2 bg-[#F4F3F0] p-5 border border-[#141414]">
            <h3 className="text-sm font-serif-heading font-bold text-[#141414] mb-3 pb-2 border-b border-[#141414]/15 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#141414]" />
              <span>নতুন ভাড়া ও বিল পরিশোধ এন্ট্রি</span>
            </h3>

            <form onSubmit={handleSubmitPayment} className="space-y-3.5 text-xs">
              {/* Tenant Selection */}
              <div>
                <label className="block font-bold text-[#141414] mb-1">
                  ভাড়াটিয়া নির্বাচন করুন (Tenant) *
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#141414]/40 font-bold text-[#141414] text-xs outline-none bg-[#EBEAE6] cursor-pointer"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.unitNumber} ({t.unitType === 'flat' ? 'ফ্ল্যাট' : 'দোকান'}) • ভাড়া: ৳{t.monthlyRent.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bill Reference (if applicable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">
                    বিলের রেফারেন্স (Bill Reference)
                  </label>
                  <select
                    value={selectedBillId}
                    onChange={(e) => {
                      setSelectedBillId(e.target.value);
                      const b = bills.find((x) => x.id === e.target.value);
                      if (b) {
                        setPaymentAmount(b.dueAmount || b.totalAmount);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border border-[#141414]/40 font-medium outline-none bg-[#EBEAE6] cursor-pointer"
                  >
                    <option value="">সাধারণ ভাড়া পেমেন্ট (Direct Payment)</option>
                    {tenantBills.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.billNumber} ({b.month} {b.year}) — বকেয়া: ৳{b.dueAmount.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#141414] mb-1">
                    পরিশোধের তারিখ (Payment Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#141414]/40 font-medium outline-none bg-[#EBEAE6]"
                  />
                </div>
              </div>

              {/* Amount & Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">
                    আদায়কৃত টাকার পরিমাণ (Amount) ৳ *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#141414] font-bold text-[#144A29] text-base outline-none bg-[#EBEAE6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#141414] mb-1">
                    পেমেন্ট মাধ্যম (Payment Method) *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-[#141414]/40 font-bold text-[#141414] outline-none bg-[#EBEAE6] cursor-pointer"
                  >
                    <option value="cash">নগদ গ্রহণ (Cash)</option>
                    <option value="mobile_banking">মোবাইল ব্যাংকিং (bKash / Nagad / Rocket)</option>
                    <option value="bank">ব্যাংক একাউন্ট / চেক (Bank Transfer / Cheque)</option>
                    <option value="other">অন্যান্য (Other)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Reference / Bank details */}
              {(paymentMethod === 'mobile_banking' || paymentMethod === 'bank') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#EBEAE6] p-3 border border-[#141414]/30">
                  <div>
                    <label className="block font-bold text-[#141414] mb-1">
                      {paymentMethod === 'mobile_banking' ? 'TrxID / মোবাইল নম্বর' : 'চেক নম্বর / স্লিপ নং'}
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder={paymentMethod === 'mobile_banking' ? 'e.g. 9KX8271A' : 'e.g. CHQ-445892'}
                      className="w-full px-2.5 py-1.5 border border-[#141414]/40 bg-[#F4F3F0] outline-none"
                    />
                  </div>

                  {paymentMethod === 'bank' && (
                    <div>
                      <label className="block font-bold text-[#141414] mb-1">ব্যাংকের নাম</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. Islami Bank / City Bank"
                        className="w-full px-2.5 py-1.5 border border-[#141414]/40 bg-[#F4F3F0] outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-[#141414] mb-1">নোট / বিবরণ (মন্তব্য)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: আগস্ট মাসের বাড়ি ভাড়া ও বিদ্যুৎ বিল বাবদ গ্রহণ করা হলো"
                  className="w-full px-2.5 py-1.5 border border-[#141414]/40 bg-[#EBEAE6] outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] border border-[#141414] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>পেমেন্ট নিশ্চিত করুন ও মানি রিসিট তৈরি করুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Dynamic Partial Payment Calculation & Receipt Preview (Requirement 6) */}
          <div className="space-y-3 font-mono-data">
            <div className="bg-[#141414] text-[#E4E3E0] p-4 border border-[#141414] space-y-3">
              <div className="flex items-center gap-2 text-[#DDDCD7] text-xs font-bold uppercase tracking-wider pb-2 border-b border-[#E4E3E0]/20">
                <Receipt className="w-4 h-4 text-[#E4E3E0]" />
                <span>পেমেন্ট ও বকেয়া হিসাব প্রিভিউ (Live)</span>
              </div>

              <div className="space-y-2 text-xs text-[#DDDCD7] pt-1">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#E4E3E0]/15">
                  <span className="text-[#DDDCD7]/70">ভাড়াটিয়া:</span>
                  <strong className="text-white">{currentTenant?.name || '---'}</strong>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-[#E4E3E0]/15">
                  <span className="text-[#DDDCD7]/70">ইউনিট নং:</span>
                  <span className="font-bold text-white">{currentTenant?.unitNumber || '---'}</span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-[#E4E3E0]/15">
                  <span className="text-[#DDDCD7]/70">মাসের বিল (Total Bill):</span>
                  <span className="font-bold text-white">{formatCurrency(billTotal)}</span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-[#E4E3E0]/15">
                  <span className="text-[#DDDCD7]/70">পূর্বে পরিশোধিত:</span>
                  <span className="font-medium text-[#7AD19D]">{formatCurrency(billPreviouslyPaid)}</span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-[#E4E3E0]/15 bg-[#2A2A28] p-2 border">
                  <span className="font-bold text-[#7AD19D]">এখন দিচ্ছেন (Paid Now):</span>
                  <span className="font-bold text-[#7AD19D] text-sm">+{formatCurrency(payingNow)}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-[#F89999]">অবশিষ্ট বকেয়া (Due):</span>
                  <span className="font-bold text-[#F89999] text-base">{formatCurrency(remainingDue)}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#DDDCD7]/70 text-[11px]">পরবর্তী বিল অবস্থা:</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 border ${
                      nextStatus === 'paid'
                        ? 'bg-[#144A29] text-[#E2EFE7] border-[#7AD19D]/40'
                        : 'bg-[#5C4300] text-[#F8EFE0] border-[#F8EFE0]/40'
                    }`}
                  >
                    {nextStatus === 'paid' ? 'সম্পূর্ণ পরিশোধ (PAID)' : 'আংশিক পরিশোধ (PARTIAL)'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#DDDCD7]/70 bg-[#2A2A28] p-2 border border-[#E4E3E0]/20 mt-2">
                ℹ️ আংশিক পেমেন্ট হলে পরবর্তী পেমেন্টে স্বয়ংক্রিয়ভাবে বাকি {formatCurrency(remainingDue)} টাকা দেখাবে।
              </div>
            </div>

            {/* Simulated Email Notice Box */}
            <div className="bg-[#E2EFE7] p-3.5 border border-[#141414] text-xs text-[#144A29] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#144A29]">
                <Mail className="w-4 h-4 text-[#144A29]" />
                <span>স্বয়ংক্রিয় ইমেইল রিসিট কপি (Auto Email)</span>
              </div>
              <p className="text-[11px] text-[#144A29]/80">
                পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই সিস্টেম ভাড়াটিয়ার নিবন্ধিত ইমেইল ঠিকানায় ডিজিটাল মানি রিসিটের কপি পাঠিয়ে দেবে।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 & 3: Payment History & Receipts List */}
      {subTab !== 'add' && (
        <div className="space-y-3 font-mono-data">
          {/* Top Summary Bar */}
          <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="রিসিট নং, ভাড়াটিয়া বা রেফারেন্স..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1 text-xs bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                aria-label="পেমেন্ট মাধ্যম ফিল্টার"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-[#141414]/30 bg-[#EBEAE6] font-bold outline-none cursor-pointer"
              >
                <option value="all">সকল পেমেন্ট মাধ্যম</option>
                <option value="cash">নগদ (Cash)</option>
                <option value="mobile_banking">মোবাইল ব্যাংকিং</option>
                <option value="bank">ব্যাংক ট্রান্সফার / চেক</option>
              </select>

              <div className="text-xs font-bold text-[#144A29] bg-[#E2EFE7] px-2.5 py-1 border border-[#141414] whitespace-nowrap">
                মোট আদায়: {formatCurrency(totalCollectedInList)}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#F4F3F0] border border-[#141414] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs tech-grid-table">
                <thead className="bg-[#EBEAE6] border-b border-[#141414] text-[#141414] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5">রিসিট নং ও তারিখ</th>
                    <th className="px-3.5 py-2.5">ভাড়াটিয়া ও ইউনিট</th>
                    <th className="px-3.5 py-2.5">পরিশোধের মাস</th>
                    <th className="px-3.5 py-2.5">আদায়কৃত টাকা</th>
                    <th className="px-3.5 py-2.5">পেমেন্ট মাধ্যম</th>
                    <th className="px-3.5 py-2.5">গ্রহীতা (Received By)</th>
                    <th className="px-3.5 py-2.5 text-right">মানি রিসিট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/15 text-[#141414]">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-[#141414]/50">
                        কোন পেমেন্ট রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#EBEAE6] transition-colors">
                        <td className="px-3.5 py-2.5">
                          <div className="font-bold text-[#141414]">{p.receiptNumber}</div>
                          <div className="text-[11px] text-[#141414]/60">{p.paymentDate}</div>
                        </td>

                        <td className="px-3.5 py-2.5">
                          <div className="font-bold text-[#141414]">{p.tenantName}</div>
                          <div className="text-[11px] text-[#141414]/70 font-semibold">{p.unitNumber}</div>
                        </td>

                        <td className="px-3.5 py-2.5 font-semibold text-[#141414]">
                          {MONTHS_BN[p.month] || p.month} {p.year}
                        </td>

                        <td className="px-3.5 py-2.5 font-bold text-[#144A29] text-xs">
                          +{formatCurrency(p.amount)}
                        </td>

                        <td className="px-3.5 py-2.5">
                          <span className="inline-block font-bold px-1.5 py-0.2 bg-[#DDDCD7] border border-[#141414]/30 text-[#141414] text-[10px]">
                            {p.paymentMethod.toUpperCase()}
                          </span>
                          {p.reference && (
                            <div className="text-[10px] text-[#141414]/60 font-mono mt-0.5">
                              {p.reference}
                            </div>
                          )}
                        </td>

                        <td className="px-3.5 py-2.5 text-[#141414]/80 font-medium">
                          {p.receivedBy}
                        </td>

                        <td className="px-3.5 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedReceiptModal(p)}
                              className="px-2 py-1 text-xs font-bold text-[#141414] bg-[#DDDCD7] hover:bg-[#C8C7C2] border border-[#141414] flex items-center gap-1 cursor-pointer"
                              title="মানি রিসিট দেখুন ও প্রিন্ট করুন"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>রিসিট</span>
                            </button>

                            {isOwner && (
                              <button
                                onClick={() => {
                                  if (confirm(`আপনি কি রিসিট ${p.receiptNumber} মুছে ফেলতে চান?`)) {
                                    deletePayment(p.id);
                                  }
                                }}
                                className="p-1 text-[#801414] hover:bg-[#FCE8E8] border border-transparent hover:border-[#801414]/30 cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
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
