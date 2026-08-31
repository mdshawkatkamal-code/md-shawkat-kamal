import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bill } from '../../types';
import {
  formatCurrency,
  MONTHS,
  MONTHS_BN,
  formatDateBn,
  toBengaliNumber,
} from '../../utils/formatters';
import {
  FileSpreadsheet,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer,
  CreditCard,
  Trash2,
  X,
  Zap,
  Sparkles,
  Home,
  Store,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BillingViewProps {
  initialSubTab?: 'generate' | 'monthly' | 'unpaid' | 'overdue';
}

export const BillingView: React.FC<BillingViewProps> = ({ initialSubTab = 'monthly' }) => {
  const {
    bills,
    tenants,
    flats,
    shops,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    generateMonthlyBills,
    createBill,
    deleteBill,
    setActiveTab,
    setSelectedReceiptModal,
    currentUser,
  } = useApp();

  const isOwner = currentUser.role === 'owner';

  const [currentSubTab, setCurrentSubTab] = useState<'generate' | 'monthly' | 'unpaid' | 'overdue'>(
    initialSubTab
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState<'all' | 'flat' | 'shop'>('all');

  // Manual Bill Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [targetTenantId, setTargetTenantId] = useState(tenants[0]?.id || '');
  const [manualRent, setManualRent] = useState(22000);
  const [manualElectricity, setManualElectricity] = useState(2500);
  const [manualWater, setManualWater] = useState(600);
  const [manualGas, setManualGas] = useState(1080);
  const [manualServiceCharge, setManualServiceCharge] = useState(1500);
  const [manualOther, setManualOther] = useState(300);

  // Single Bill Print/View Modal
  const [selectedBillForView, setSelectedBillForView] = useState<Bill | null>(null);

  // Automatic Generation Handler
  const handleBatchGenerate = () => {
    const result = generateMonthlyBills(selectedMonth, selectedYear);
    if (result.generatedCount > 0) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
    alert(
      `মাসিক বিল তৈরি সম্পন্ন!\n• সফলভাবে তৈরি হয়েছে: ${result.generatedCount} টি বিল\n• আগে থেকে বিদ্যমান ছিল: ${result.skippedCount} টি\nমাস: ${MONTHS_BN[selectedMonth] || selectedMonth} ${selectedYear}`
    );
    setCurrentSubTab('monthly');
  };

  const handleCreateManualBill = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find((t) => t.id === targetTenantId);
    if (!tenant) return;

    const total =
      Number(manualRent) +
      Number(manualElectricity) +
      Number(manualWater) +
      Number(manualGas) +
      Number(manualServiceCharge) +
      Number(manualOther);

    createBill({
      month: selectedMonth,
      year: selectedYear,
      date: `${selectedYear}-08-01`,
      dueDate: `${selectedYear}-08-10`,
      unitType: tenant.unitType,
      unitId: tenant.unitId,
      unitNumber: tenant.unitNumber,
      tenantId: tenant.id,
      tenantName: tenant.name,
      items: {
        rent: Number(manualRent),
        electricity: Number(manualElectricity),
        water: Number(manualWater),
        gas: Number(manualGas),
        serviceCharge: Number(manualServiceCharge),
        other: Number(manualOther),
      },
      totalAmount: total,
      paidAmount: 0,
      dueAmount: total,
      status: 'unpaid',
      generatedBy: `${currentUser.name} (${currentUser.role})`,
    });

    setIsManualModalOpen(false);
    setCurrentSubTab('monthly');
  };

  // Filter bills based on month, subtab, and search
  const filteredBills = bills.filter((b) => {
    const matchesMonth = b.month === selectedMonth && b.year === selectedYear;
    const matchesSearch =
      b.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.billNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = unitTypeFilter === 'all' || b.unitType === unitTypeFilter;

    if (currentSubTab === 'unpaid') {
      return (b.status === 'unpaid' || b.status === 'partial') && matchesSearch && matchesType;
    }
    if (currentSubTab === 'overdue') {
      return (
        (b.status === 'overdue' || (b.dueAmount > 0 && b.month !== selectedMonth)) &&
        matchesSearch &&
        matchesType
      );
    }
    return matchesMonth && matchesSearch && matchesType;
  });

  const totalBillSum = filteredBills.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalPaidSum = filteredBills.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalDueSum = filteredBills.reduce((acc, b) => acc + b.dueAmount, 0);

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#141414]" />
            <span>মাসিক বিলিং সিস্টেম (Monthly Billing System)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            মাস ও বছরভিত্তিক বাড়ি ভাড়া, বিদ্যুৎ, পানি, গ্যাস ও সার্ভিস চার্জের স্বয়ংক্রিয় বিলিং
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap font-mono-data">
          {/* Month Selector */}
          <div className="flex items-center gap-1 bg-[#F4F3F0] px-2.5 py-1 border border-[#141414] text-xs">
            <span className="font-bold text-[#141414]/60">মাস:</span>
            <select
              aria-label="বিলিং মাস নির্বাচন"
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
              aria-label="বিলিং বছর নির্বাচন"
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
            onClick={() => setIsManualModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#141414] bg-[#DDDCD7] hover:bg-[#C8C7C2] border border-[#141414] transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#141414]" />
            <span>ম্যানুয়াল বিল তৈরি</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Generate Bills | Monthly Bills | Unpaid Bills | Overdue Bills */}
      <div className="flex items-center justify-between border-b border-[#141414]/20 gap-2 overflow-x-auto pb-0.5 font-mono-data">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentSubTab('monthly')}
            className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              currentSubTab === 'monthly'
                ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
                : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>
              মাসিক বিল তালিকা ({MONTHS_BN[selectedMonth]} {selectedYear})
            </span>
          </button>

          <button
            onClick={() => setCurrentSubTab('generate')}
            className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              currentSubTab === 'generate'
                ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
                : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>স্বয়ংক্রিয় বিল জেনারেটর</span>
          </button>

          <button
            onClick={() => setCurrentSubTab('unpaid')}
            className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              currentSubTab === 'unpaid'
                ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
                : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>অপরিশোধিত বিল (Unpaid)</span>
          </button>

          <button
            onClick={() => setCurrentSubTab('overdue')}
            className={`px-3 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              currentSubTab === 'overdue'
                ? 'border-[#141414] text-[#141414] bg-[#EBEAE6]'
                : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-[#801414]" />
            <span>বকেয়া বিল (Overdue)</span>
          </button>
        </div>
      </div>

      {/* Subtab Content 1: Generate Bills View (Requirement 5) */}
      {currentSubTab === 'generate' && (
        <div className="bg-[#F4F3F0] p-6 border border-[#141414] text-center max-w-2xl mx-auto space-y-4 font-mono-data">
          <div className="w-12 h-12 bg-[#141414] text-[#E4E3E0] flex items-center justify-center mx-auto border border-[#141414]">
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-serif-heading font-bold text-[#141414]">
              স্বয়ংক্রিয় মাসিক বিল তৈরি (Automatic Monthly Bill)
            </h3>
            <p className="text-xs text-[#141414]/70 mt-1 max-w-md mx-auto">
              সিস্টেম স্বয়ংক্রিয়ভাবে সব Active Flat এবং Shop-এর জন্য নির্ধারিত বাড়িভাড়া ও ডিফল্ট ইউটিলিটি চার্জ অনুযায়ী বিল তৈরি করবে।
            </p>
          </div>

          <div className="bg-[#EBEAE6] p-3.5 border border-[#141414]/30 max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#141414]">
              <span>বিল তৈরির মাস:</span>
              <strong className="text-[#141414] font-bold">
                {MONTHS_BN[selectedMonth] || selectedMonth} {selectedYear}
              </strong>
            </div>
            <div className="flex items-center justify-between text-[#141414]">
              <span>সক্রিয় ভাড়াটিয়া সংখ্যা:</span>
              <strong className="font-bold text-[#141414]">{tenants.filter((t) => t.status === 'active').length} জন</strong>
            </div>
            <div className="flex items-center justify-between text-[#141414]">
              <span>বিলের নির্ধারিত পরিশোধের তারিখ:</span>
              <span className="font-bold text-[#141414]">{selectedYear}-08-10</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleBatchGenerate}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] border border-[#141414] transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Generate Bills → {selectedMonth} {selectedYear}</span>
            </button>
          </div>
        </div>
      )}

      {/* Subtab Content: Monthly / Unpaid / Overdue Bills Table */}
      {currentSubTab !== 'generate' && (
        <div className="space-y-3 font-mono-data">
          {/* 3 Metrics Mini Bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#F4F3F0] p-3 border border-[#141414]">
              <span className="text-[10px] font-bold text-[#141414]/70 uppercase">মোট বিলের পরিমাণ</span>
              <div className="text-base font-bold text-[#141414] mt-0.5">
                {formatCurrency(totalBillSum)}
              </div>
            </div>
            <div className="bg-[#E2EFE7] p-3 border border-[#141414]">
              <span className="text-[10px] font-bold text-[#144A29] uppercase">মোট আদায়</span>
              <div className="text-base font-bold text-[#144A29] mt-0.5">
                {formatCurrency(totalPaidSum)}
              </div>
            </div>
            <div className="bg-[#FCE8E8] p-3 border border-[#141414]">
              <span className="text-[10px] font-bold text-[#801414] uppercase">মোট বাকি / বকেয়া</span>
              <div className="text-base font-bold text-[#801414] mt-0.5">
                {formatCurrency(totalDueSum)}
              </div>
            </div>
          </div>

          {/* Search & Type filter */}
          <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ভাড়াটিয়ার নাম, ফ্ল্যাট/দোকান নং বা বিল নং..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1 text-xs bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="ইউনিটের ধরন ফিল্টার"
                value={unitTypeFilter}
                onChange={(e: any) => setUnitTypeFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-[#141414]/30 bg-[#EBEAE6] font-bold outline-none cursor-pointer"
              >
                <option value="all">সকল ইউনিট (Flats + Shops)</option>
                <option value="flat">শুধুমাত্র ফ্ল্যাটসমূহ</option>
                <option value="shop">শুধুমাত্র দোকানসমূহ</option>
              </select>
            </div>
          </div>

          {/* Bills Table */}
          <div className="bg-[#F4F3F0] border border-[#141414] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs tech-grid-table">
                <thead className="bg-[#EBEAE6] border-b border-[#141414] text-[#141414] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5">বিল নম্বর ও মাস</th>
                    <th className="px-3.5 py-2.5">ভাড়াটিয়া ও ইউনিট</th>
                    <th className="px-3.5 py-2.5">বিলের বিবরণ</th>
                    <th className="px-3.5 py-2.5">মোট বিল</th>
                    <th className="px-3.5 py-2.5">পরিশোধ</th>
                    <th className="px-3.5 py-2.5">বকেয়া</th>
                    <th className="px-3.5 py-2.5">অবস্থা (Status)</th>
                    <th className="px-3.5 py-2.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/15 text-[#141414]">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-[#141414]/50">
                        কোন বিল পাওয়া যায়নি। স্বয়ংক্রিয় বিল জেনারেটর ব্যবহার করে বিল তৈরি করুন।
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => {
                      const isFlat = bill.unitType === 'flat';

                      return (
                        <tr key={bill.id} className="hover:bg-[#EBEAE6] transition-colors">
                          <td className="px-3.5 py-2.5">
                            <div className="font-bold text-[#141414]">{bill.billNumber}</div>
                            <div className="text-[11px] text-[#141414]/60">
                              {MONTHS_BN[bill.month] || bill.month} {bill.year}
                            </div>
                          </td>

                          <td className="px-3.5 py-2.5">
                            <div className="font-bold text-[#141414]">{bill.tenantName}</div>
                            <div className="flex items-center gap-1 text-[11px] text-[#141414]/60 mt-0.5">
                              <span className="font-bold text-[#141414]">{bill.unitNumber}</span>
                              <span>({isFlat ? 'Flat' : 'Shop'})</span>
                            </div>
                          </td>

                          <td className="px-3.5 py-2.5 text-[11px] text-[#141414]/70">
                            <div>ভাড়া: {formatCurrency(bill.items.rent)}</div>
                            <div className="text-[#141414]/50">
                              বিদ্যুৎ {formatCurrency(bill.items.electricity)} • গ্যাস {formatCurrency(bill.items.gas)} • সার্ভিস {formatCurrency(bill.items.serviceCharge)}
                            </div>
                          </td>

                          <td className="px-3.5 py-2.5 font-bold text-[#141414]">
                            {formatCurrency(bill.totalAmount)}
                          </td>

                          <td className="px-3.5 py-2.5 font-bold text-[#144A29]">
                            {formatCurrency(bill.paidAmount)}
                          </td>

                          <td className="px-3.5 py-2.5 font-bold text-[#801414]">
                            {formatCurrency(bill.dueAmount)}
                          </td>

                          <td className="px-3.5 py-2.5">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.2 border text-[10px] font-bold ${
                                bill.status === 'paid'
                                  ? 'bg-[#D2E3D8] text-[#144A29] border-[#144A29]/30'
                                  : bill.status === 'partial'
                                  ? 'bg-[#F8EFE0] text-[#5C4300] border-[#5C4300]/30'
                                  : 'bg-[#FCE8E8] text-[#801414] border-[#801414]/30'
                              }`}
                            >
                              {bill.status === 'paid'
                                ? 'পরিশোধিত'
                                : bill.status === 'partial'
                                ? 'আংশিক'
                                : 'বকেয়া'}
                            </span>
                          </td>

                          <td className="px-3.5 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {bill.dueAmount > 0 && (
                                <button
                                  onClick={() => setActiveTab('payments-add')}
                                  className="px-2 py-1 text-xs font-bold text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] border border-[#141414] flex items-center gap-1 cursor-pointer"
                                  title="ভাড়া আদায় করুন"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>আদায়</span>
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedBillForView(bill)}
                                className="p-1 text-[#141414]/70 hover:text-[#141414] hover:bg-[#DDDCD7] border border-transparent hover:border-[#141414]/30 cursor-pointer"
                                title="বিল ইনভয়েস দেখুন / প্রিন্ট করুন"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              {isOwner && (
                                <button
                                  onClick={() => {
                                    if (confirm(`আপনি কি বিল ${bill.billNumber} মুছে ফেলতে চান?`)) {
                                      deleteBill(bill.id);
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Bill Creation Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#141414]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-[#F4F3F0] max-w-lg w-full p-5 sm:p-6 border-2 border-[#141414] shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#141414]/20">
              <h3 className="text-base font-serif-heading font-bold text-[#141414] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#141414]" />
                <span>ম্যানুয়াল একক বিল তৈরি ({selectedMonth} {selectedYear})</span>
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-[#141414] hover:bg-[#DDDCD7] p-1 border border-transparent hover:border-[#141414]/30 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBill} className="mt-4 space-y-3 text-xs font-mono-data">
              <div>
                <label className="block font-bold text-[#141414] mb-1">ভাড়াটিয়া নির্বাচন করুন *</label>
                <select
                  value={targetTenantId}
                  onChange={(e) => {
                    setTargetTenantId(e.target.value);
                    const t = tenants.find((x) => x.id === e.target.value);
                    if (t) setManualRent(t.monthlyRent);
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold outline-none cursor-pointer"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.unitNumber} ({t.unitType.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">মাসিক বাড়ি/দোকান ভাড়া (৳) *</label>
                  <input
                    type="number"
                    required
                    value={manualRent}
                    onChange={(e) => setManualRent(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#144A29] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#141414] mb-1">বিদ্যুৎ বিল (৳)</label>
                  <input
                    type="number"
                    value={manualElectricity}
                    onChange={(e) => setManualElectricity(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">পানি বিল (Water)</label>
                  <input
                    type="number"
                    value={manualWater}
                    onChange={(e) => setManualWater(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#141414] mb-1">গ্যাস বিল (Gas)</label>
                  <input
                    type="number"
                    value={manualGas}
                    onChange={(e) => setManualGas(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">সার্ভিস চার্জ (৳)</label>
                  <input
                    type="number"
                    value={manualServiceCharge}
                    onChange={(e) => setManualServiceCharge(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#141414] mb-1">অন্যান্য চার্জ (৳)</label>
                  <input
                    type="number"
                    value={manualOther}
                    onChange={(e) => setManualOther(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#EBEAE6] p-2.5 border border-[#141414] flex items-center justify-between">
                <span className="font-bold text-[#141414]">মোট বিলের পরিমাণ:</span>
                <span className="font-bold text-[#144A29] text-base">
                  {formatCurrency(
                    Number(manualRent) +
                      Number(manualElectricity) +
                      Number(manualWater) +
                      Number(manualGas) +
                      Number(manualServiceCharge) +
                      Number(manualOther)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-[#141414]/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3 py-1.5 text-[#141414] bg-[#DDDCD7] hover:bg-[#C8C7C2] border border-[#141414]/40 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] border border-[#141414] font-bold cursor-pointer"
                >
                  বিল তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill View / Printable Invoice Modal */}
      {selectedBillForView && (
        <div className="fixed inset-0 z-50 bg-[#141414]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-[#F4F3F0] max-w-lg w-full p-5 sm:p-6 border-2 border-[#141414] shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#141414]/20 no-print">
              <h3 className="text-base font-serif-heading font-bold text-[#141414]">মাসিক বিল ইনভয়েস</h3>
              <div className="flex items-center gap-2 font-mono-data">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#DDDCD7] text-[#141414] border border-[#141414]/40 font-bold text-xs hover:bg-[#C8C7C2] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট</span>
                </button>
                <button
                  onClick={() => setSelectedBillForView(null)}
                  className="text-[#141414] hover:bg-[#DDDCD7] p-1 border border-transparent hover:border-[#141414]/30 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div id="printable-area" className="py-4 space-y-3.5 text-xs font-mono-data">
              <div className="text-center pb-3 border-b border-[#141414]/20">
                <h2 className="text-base font-serif-heading font-bold text-[#141414]">নূর টাওয়ার কমার্শিয়াল ও রেসিডেন্সিয়াল</h2>
                <p className="text-[11px] text-[#141414]/60">উত্তরা, ঢাকা-১২৩০ • ফোন: +৮৮০ ১৭১১-২৩৪৫৬৭</p>
                <div className="inline-block mt-2 px-2.5 py-0.5 bg-[#EBEAE6] border border-[#141414]/30 font-bold text-[#141414]">
                  মাসিক বিল — {MONTHS_BN[selectedBillForView.month]} {selectedBillForView.year}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#EBEAE6] p-3 border border-[#141414]/30 text-[11px]">
                <div>
                  <span className="text-[#141414]/60">ভাড়াটিয়ার নাম:</span>
                  <p className="font-bold text-[#141414]">{selectedBillForView.tenantName}</p>
                </div>
                <div>
                  <span className="text-[#141414]/60">ইউনিট নং:</span>
                  <p className="font-bold text-[#141414]">{selectedBillForView.unitNumber}</p>
                </div>
                <div>
                  <span className="text-[#141414]/60">বিল নং:</span>
                  <p className="font-medium text-[#141414]">{selectedBillForView.billNumber}</p>
                </div>
                <div>
                  <span className="text-[#141414]/60">পরিশোধের শেষ তারিখ:</span>
                  <p className="font-medium text-[#141414]">{selectedBillForView.dueDate}</p>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-[#141414] overflow-hidden">
                <table className="w-full text-left text-xs tech-grid-table">
                  <thead className="bg-[#EBEAE6] font-bold text-[#141414] border-b border-[#141414]">
                    <tr>
                      <th className="p-2">বিলের বিবরণ</th>
                      <th className="p-2 text-right">পরিমাণ (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]/15">
                    <tr>
                      <td className="p-2">মূল বাড়ি / দোকান ভাড়া (House Rent)</td>
                      <td className="p-2 text-right font-bold">{formatCurrency(selectedBillForView.items.rent)}</td>
                    </tr>
                    <tr>
                      <td className="p-2">বিদ্যুৎ বিল (Electricity)</td>
                      <td className="p-2 text-right">{formatCurrency(selectedBillForView.items.electricity)}</td>
                    </tr>
                    <tr>
                      <td className="p-2">পানি বিল (Water)</td>
                      <td className="p-2 text-right">{formatCurrency(selectedBillForView.items.water)}</td>
                    </tr>
                    <tr>
                      <td className="p-2">গ্যাস বিল (Gas)</td>
                      <td className="p-2 text-right">{formatCurrency(selectedBillForView.items.gas)}</td>
                    </tr>
                    <tr>
                      <td className="p-2">সার্ভিস চার্জ (Service Charge)</td>
                      <td className="p-2 text-right">{formatCurrency(selectedBillForView.items.serviceCharge)}</td>
                    </tr>
                    {selectedBillForView.items.other > 0 && (
                      <tr>
                        <td className="p-2">অন্যান্য চার্জ (Other)</td>
                        <td className="p-2 text-right">{formatCurrency(selectedBillForView.items.other)}</td>
                      </tr>
                    )}
                    <tr className="bg-[#EBEAE6] font-bold text-[#141414] border-t-2 border-[#141414]">
                      <td className="p-2 text-xs">সর্বমোট বিল (Total)</td>
                      <td className="p-2 text-right text-xs font-bold text-[#144A29]">
                        {formatCurrency(selectedBillForView.totalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#EBEAE6] border border-[#141414]/30">
                <div>
                  <span className="text-[10px] text-[#141414]/60 uppercase font-bold">পরিশোধিত:</span>
                  <p className="font-bold text-[#144A29]">{formatCurrency(selectedBillForView.paidAmount)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#141414]/60 uppercase font-bold">বর্তমান বকেয়া:</span>
                  <p className="font-bold text-[#801414]">{formatCurrency(selectedBillForView.dueAmount)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#141414]/60 uppercase font-bold">বিলের অবস্থা:</span>
                  <p className="font-bold text-[#141414]">{selectedBillForView.status.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
