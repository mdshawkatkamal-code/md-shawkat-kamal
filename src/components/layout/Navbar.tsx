import React from 'react';
import { useApp } from '../../context/AppContext';
import { MONTHS, MONTHS_BN, formatDateBn, toBengaliNumber } from '../../utils/formatters';
import {
  Calendar,
  Building2,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  Receipt,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    settings,
    setActiveTab,
    generateMonthlyBills,
  } = useApp();

  const todayStr = '2026-08-29';
  const isOwner = currentUser.role === 'owner';

  const handleQuickGenerateBills = () => {
    const res = generateMonthlyBills(selectedMonth, selectedYear);
    alert(
      `স্বয়ংক্রিয় বিল তৈরি সম্পন্ন!\n• সফলভাবে তৈরি হয়েছে: ${res.generatedCount} টি বিল\n• আগে থেকে বিদ্যমান ছিল: ${res.skippedCount} টি\nমাস: ${MONTHS_BN[selectedMonth] || selectedMonth} ${selectedYear}`
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-[#EBEAE6] border-b border-[#141414] shadow-xs">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Property Branding & Today's Date Banner */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 bg-[#141414] text-[#E4E3E0] font-mono font-bold text-sm border border-[#141414]">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-[#141414] truncate leading-tight flex items-center gap-2">
                <span className="font-serif-heading font-bold text-base tracking-tight">{settings.propertyNameBn}</span>
                <span className="hidden md:inline-block font-mono-data text-[11px] font-semibold text-[#141414]/70 bg-[#DDDCD7] px-1.5 py-0.5 border border-[#141414]/20 uppercase">
                  {settings.propertyName}
                </span>
              </h1>
              {/* Top Banner: আজকের তারিখ | বর্তমান মাস | Current Year */}
              <div className="flex items-center gap-2 text-[11px] text-[#141414]/80 mt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1 font-mono-data bg-[#DDDCD7] text-[#141414] px-1.5 py-0.2 border border-[#141414]/20">
                  <Calendar className="w-3 h-3 text-[#141414]" />
                  আজকের তারিখ: {formatDateBn(todayStr)}
                </span>
                <span className="text-[#141414]/30 hidden sm:inline">|</span>
                <span className="hidden sm:inline font-mono-data bg-[#D2E3D8] text-[#144A29] px-1.5 py-0.2 border border-[#144A29]/30 font-medium">
                  বর্তমান মাস: {MONTHS_BN[selectedMonth] || selectedMonth} {toBengaliNumber(selectedYear)}
                </span>
              </div>
            </div>
          </div>

          {/* Month & Year Global Switcher + Quick Actions + User Role Selector */}
          <div className="flex items-center gap-2">
            {/* Month & Year Selector */}
            <div className="hidden lg:flex items-center gap-1 bg-[#DDDCD7] p-1 border border-[#141414]/30 text-xs">
              <select
                aria-label="মাস নির্বাচন করুন"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-[#F4F3F0] text-[#141414] font-mono-data font-semibold px-2 py-0.5 border border-[#141414]/30 outline-none focus:border-[#141414] text-xs cursor-pointer"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {MONTHS_BN[m]} ({m})
                  </option>
                ))}
              </select>
              <select
                aria-label="বছর নির্বাচন করুন"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-[#F4F3F0] text-[#141414] font-mono-data font-semibold px-2 py-0.5 border border-[#141414]/30 outline-none focus:border-[#141414] text-xs cursor-pointer"
              >
                <option value={2025}>2025 (২০২৫)</option>
                <option value={2026}>2026 (২০২৬)</option>
                <option value={2027}>2027 (২০২৭)</option>
              </select>
            </div>

            {/* Quick Action Button: Add Payment */}
            <button
              onClick={() => setActiveTab('payments-add')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono-data font-bold text-[#E4E3E0] bg-[#141414] hover:bg-[#333333] border border-[#141414] transition-colors cursor-pointer"
              title="নতুন ভাড়া / বিল আদায় এন্ট্রি"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">পেমেন্ট গ্রহণ</span>
              <span className="sm:hidden">পেমেন্ট</span>
            </button>

            {/* User Role Switcher Dropdown */}
            <div className="relative flex items-center bg-[#DDDCD7] border border-[#141414] p-0.5">
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono-data font-bold ${
                  isOwner
                    ? 'bg-[#EBDCB2] text-[#5C4300] border border-[#8C6600]/40'
                    : 'bg-[#D2E3D8] text-[#144A29] border border-[#144A29]/30'
                }`}
              >
                {isOwner ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5C4300]" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-[#144A29]" />
                )}
                <span>{isOwner ? 'মালিক (Owner)' : 'ম্যানেজার (Manager)'}</span>
              </div>

              <select
                aria-label="ব্যবহারকারী পরিবর্তন করুন"
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="ml-1 text-xs font-mono-data bg-transparent text-[#141414] font-medium py-0.5 px-1 outline-none cursor-pointer hover:text-black"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'owner' ? 'Owner' : 'Manager'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
