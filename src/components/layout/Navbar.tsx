import React from 'react';
import { useApp } from '../../context/AppContext';
import { MONTHS, MONTHS_BN, formatDateBn, toBengaliNumber } from '../../utils/formatters';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  Calendar,
  Building2,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  Receipt,
  Menu,
  Bell,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileDrawer }) => {
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
    approachingReminders,
  } = useApp();

  const [isRemindersDropdownOpen, setIsRemindersDropdownOpen] = React.useState(false);

  const todayStr = '2026-08-29';
  const isOwner = currentUser.role === 'owner';

  return (
    <header className="sticky top-0 z-30 bg-[#EBEAE6] border-b border-[#141414] shadow-xs pt-[env(safe-area-inset-top)]">
      <div className="w-full px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Mobile Hamburger + Property Branding & Today's Date */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onOpenMobileDrawer && (
              <button
                onClick={onOpenMobileDrawer}
                className="lg:hidden p-1.5 bg-[#DDDCD7] hover:bg-[#D0CFCA] border border-[#141414] text-[#141414] transition-colors cursor-pointer"
                title="মেনু খুলুন"
                aria-label="মোবাইল মেনু"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center justify-center w-8 h-8 bg-[#141414] text-[#E4E3E0] font-mono font-bold text-sm border border-[#141414] shrink-0">
              <Building2 className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm font-bold text-[#141414] truncate leading-tight flex items-center gap-2">
                <span className="font-serif-heading font-bold text-sm sm:text-base tracking-tight truncate">
                  {settings.propertyNameBn}
                </span>
                <span className="hidden md:inline-block font-mono-data text-[11px] font-semibold text-[#141414]/70 bg-[#DDDCD7] px-1.5 py-0.5 border border-[#141414]/20 uppercase">
                  {settings.propertyName}
                </span>
              </h1>
              {/* Top Banner: আজকের তারিখ | বর্তমান মাস | Current Year */}
              <div className="flex items-center gap-2 text-[11px] text-[#141414]/80 mt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1 font-mono-data bg-[#DDDCD7] text-[#141414] px-1.5 py-0.2 border border-[#141414]/20 text-[10px] sm:text-[11px]">
                  <Calendar className="w-3 h-3 text-[#141414]" />
                  <span className="hidden xs:inline">তারিখ: </span>{formatDateBn(todayStr)}
                </span>
                <span className="text-[#141414]/30 hidden sm:inline">|</span>
                <span className="hidden sm:inline font-mono-data bg-[#D2E3D8] text-[#144A29] px-1.5 py-0.2 border border-[#144A29]/30 font-medium">
                  মাস: {MONTHS_BN[selectedMonth] || selectedMonth} {toBengaliNumber(selectedYear)}
                </span>
              </div>
            </div>
          </div>

          {/* Month & Year Global Switcher + PWA Install + Quick Actions + User Role Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* PWA In-App Install Prompt Button */}
            <PWAInstallButton variant="navbar" />

            {/* Desktop Month & Year Selector */}
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

            {/* Quick Action Button: Add Expense */}
            <button
              onClick={() => setActiveTab('expenses-add')}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-mono-data font-bold text-[#801414] bg-[#FCE8E8] hover:bg-[#FADADA] border border-[#801414]/40 transition-colors cursor-pointer"
              title="নতুন ব্যয় / ভাউচার এন্ট্রি"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#801414]" />
              <span className="hidden sm:inline">খরচ এন্ট্রি</span>
              <span className="sm:hidden text-[11px]">খরচ</span>
            </button>

            {/* Quick Action Button: Add Payment */}
            <button
              onClick={() => setActiveTab('payments-add')}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-mono-data font-bold text-[#E4E3E0] bg-[#141414] hover:bg-[#333333] border border-[#141414] transition-colors cursor-pointer"
              title="নতুন ভাড়া / বিল আদায় এন্ট্রি"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">পেমেন্ট গ্রহণ</span>
              <span className="sm:hidden text-[11px]">পেমেন্ট</span>
            </button>

            {/* Notification Bell for Rent Reminders */}
            <div className="relative">
              <button
                type="button"
                id="navbar-reminder-bell-btn"
                onClick={() => setIsRemindersDropdownOpen(!isRemindersDropdownOpen)}
                className="relative p-2 bg-[#DDDCD7] hover:bg-[#D0CFCA] border border-[#141414] text-[#141414] transition-colors cursor-pointer flex items-center justify-center"
                title="ভাড়া পরিশোধ রিমাইন্ডার ও নোটিফিকেশন"
                aria-label="রিমাইন্ডার"
              >
                <Bell className="w-4 h-4 text-amber-800" />
                {approachingReminders.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                    {approachingReminders.length}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isRemindersDropdownOpen && (
                <div
                  id="navbar-reminders-popover"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800"
                >
                  <div className="p-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-200" />
                      <span className="font-bold text-sm">আসন্ন ভাড়া রিমাইন্ডার</span>
                    </div>
                    <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      {toBengaliNumber(approachingReminders.length)} জন
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {approachingReminders.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        বর্তমানে কোনো আসন্ন ভাড়া রিমাইন্ডার নেই।
                      </div>
                    ) : (
                      approachingReminders.slice(0, 5).map((rem) => (
                        <div
                          key={rem.id}
                          className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                              <span>{rem.unitNumber}</span>
                              <span className="text-slate-400 font-normal">•</span>
                              <span className="text-slate-600">{rem.tenantName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              প্রদেয়: ৳{toBengaliNumber(rem.totalDue)} •{' '}
                              <span
                                className={`font-semibold ${
                                  rem.daysUntilDue === 0
                                    ? 'text-amber-600'
                                    : rem.daysUntilDue < 0
                                    ? 'text-rose-600'
                                    : 'text-emerald-600'
                                }`}
                              >
                                {rem.daysUntilDue === 0
                                  ? 'আজ শেষ দিন'
                                  : rem.daysUntilDue > 0
                                  ? `${toBengaliNumber(rem.daysUntilDue)} দিন বাকি`
                                  : `${toBengaliNumber(Math.abs(rem.daysUntilDue))} দিন অতিবাহিত`}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setIsRemindersDropdownOpen(false);
                              setActiveTab('reminders');
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-1 shrink-0"
                          >
                            <Smartphone className="w-3 h-3 text-emerald-600" />
                            <span>পাঠান</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRemindersDropdownOpen(false);
                        setActiveTab('reminders');
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center justify-center gap-1 w-full py-1"
                    >
                      <span>সকল রিমাইন্ডার ও এসএমএস সেটিংস দেখুন</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Role Switcher Dropdown */}
            <div className="hidden sm:flex items-center bg-[#DDDCD7] border border-[#141414] p-0.5">
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
                <span className="hidden md:inline">{isOwner ? 'মালিক (Owner)' : 'ম্যানেজার (Manager)'}</span>
                <span className="md:hidden">{isOwner ? 'মালিক' : 'ম্যানেজার'}</span>
              </div>

              <select
                aria-label="ব্যবহারকারী পরিবর্তন করুন"
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="ml-1 text-xs font-mono-data bg-transparent text-[#141414] font-medium py-0.5 px-1 outline-none cursor-pointer hover:text-black"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
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
