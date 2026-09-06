import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { MONTHS, MONTHS_BN, toBengaliNumber } from '../../utils/formatters';
import {
  LayoutDashboard,
  Building,
  Home,
  Store,
  Users,
  FileSpreadsheet,
  PlusCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Receipt,
  Wallet,
  BookOpen,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Scale,
  FileText,
  CalendarDays,
  UserCog,
  History,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  X,
  Smartphone,
  Bell,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    users,
    switchUser,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    settings,
    bills,
    approachingReminders,
  } = useApp();

  const isOwner = currentUser.role === 'owner';
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [billingOpen, setBillingOpen] = useState(true);
  const [paymentsOpen, setPaymentsOpen] = useState(true);
  const [expensesOpen, setExpensesOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(true);

  if (!isOpen) return null;

  const unpaidCount = bills.filter((b) => b.status === 'unpaid' || b.status === 'partial').length;
  const overdueCount = bills.filter((b) => b.status === 'overdue' || (b.dueAmount > 0 && b.month !== 'August')).length;

  const handleSelectTab = (tab: any) => {
    setActiveTab(tab);
    onClose();
  };

  const navItemClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `flex items-center justify-between w-full px-3 py-2 text-xs font-mono-data font-semibold border transition-all cursor-pointer ${
      isActive
        ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
        : 'text-[#141414] bg-transparent border-transparent hover:bg-[#DDDCD7]'
    }`;
  };

  const subItemClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `flex items-center justify-between w-full pl-7 pr-3 py-1.5 text-xs font-mono-data font-medium border transition-all cursor-pointer ${
      isActive
        ? 'bg-[#DDDCD7] text-[#141414] font-bold border-[#141414] border-l-2'
        : 'text-[#141414]/80 bg-transparent border-transparent hover:bg-[#DDDCD7]/60'
    }`;
  };

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-80 max-w-[85vw] bg-[#EBEAE6] h-full shadow-2xl flex flex-col justify-between border-r-2 border-[#141414] z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-3.5 bg-[#141414] text-[#E4E3E0] flex items-center justify-between border-b border-[#141414]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E4E3E0] text-[#141414] flex items-center justify-center font-bold font-mono text-xs">
              BM
            </div>
            <div>
              <h2 className="font-serif-heading font-bold text-sm tracking-tight text-[#E4E3E0]">
                {settings.propertyNameBn}
              </h2>
              <span className="text-[10px] font-mono-data text-[#E4E3E0]/70">মোবাইল মেনু</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#2A2A28] text-[#E4E3E0] border border-transparent hover:border-[#E4E3E0]/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Month/Year and User Selector for Mobile */}
        <div className="p-3 bg-[#DDDCD7] border-b border-[#141414]/20 space-y-2 font-mono-data text-xs">
          <div className="flex items-center gap-1.5">
            <select
              aria-label="মাস নির্বাচন করুন"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex-1 bg-[#F4F3F0] text-[#141414] font-semibold px-2 py-1 border border-[#141414]/30 outline-none text-xs"
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
              className="bg-[#F4F3F0] text-[#141414] font-semibold px-2 py-1 border border-[#141414]/30 outline-none text-xs"
            >
              <option value={2025}>২০২৫</option>
              <option value={2026}>২০২৬</option>
              <option value={2027}>২০২৭</option>
            </select>
          </div>

          <div className="flex items-center justify-between bg-[#F4F3F0] p-1 border border-[#141414]/30 text-xs">
            <div className="flex items-center gap-1 font-bold text-[11px]">
              {isOwner ? (
                <ShieldCheck className="w-3.5 h-3.5 text-[#8C6600]" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-[#144A29]" />
              )}
              <span>{isOwner ? 'মালিক' : 'ম্যানেজার'}</span>
            </div>
            <select
              aria-label="রোল পরিবর্তন"
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="text-xs bg-transparent text-[#141414] font-medium outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1 custom-scrollbar">
          {/* Dashboard */}
          <button onClick={() => handleSelectTab('dashboard')} className={navItemClass('dashboard')}>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>ড্যাশবোর্ড (Dashboard)</span>
            </div>
          </button>

          {/* Properties */}
          <div className="pt-1">
            <button
              onClick={() => setPropertiesOpen(!propertiesOpen)}
              className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-mono-data font-bold text-[#141414]/60 uppercase tracking-wider border-b border-[#141414]/15"
            >
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>সম্পত্তি (Properties)</span>
              </div>
              {propertiesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {propertiesOpen && (
              <div className="space-y-0.5 mt-1">
                <button onClick={() => handleSelectTab('flats')} className={subItemClass('flats')}>
                  <div className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5" />
                    <span>ফ্ল্যাটসমূহ (Flats)</span>
                  </div>
                  <span className="text-[10px] bg-[#DDDCD7] px-1 border border-[#141414]/20">80</span>
                </button>
                <button onClick={() => handleSelectTab('shops')} className={subItemClass('shops')}>
                  <div className="flex items-center gap-2">
                    <Store className="w-3.5 h-3.5" />
                    <span>দোকানসমূহ (Shops)</span>
                  </div>
                  <span className="text-[10px] bg-[#DDDCD7] px-1 border border-[#141414]/20">20</span>
                </button>
              </div>
            )}
          </div>

          {/* Tenants */}
          <button onClick={() => handleSelectTab('tenants')} className={navItemClass('tenants')}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>ভাড়াটিয়া তালিকা (Tenants)</span>
            </div>
          </button>

          {/* Billing */}
          <div className="pt-1">
            <button
              onClick={() => setBillingOpen(!billingOpen)}
              className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-mono-data font-bold text-[#141414]/60 uppercase tracking-wider border-b border-[#141414]/15"
            >
              <div className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>বিলিং (Billing)</span>
              </div>
              {billingOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {billingOpen && (
              <div className="space-y-0.5 mt-1">
                <button onClick={() => handleSelectTab('billing-generate')} className={subItemClass('billing-generate')}>
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-3.5 h-3.5 text-[#144A29]" />
                    <span>বিল তৈরি (Generate)</span>
                  </div>
                </button>
                <button onClick={() => handleSelectTab('billing-monthly')} className={subItemClass('billing-monthly')}>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>মাসিক বিল (Monthly)</span>
                  </div>
                </button>
                <button onClick={() => handleSelectTab('billing-unpaid')} className={subItemClass('billing-unpaid')}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#8C6600]" />
                    <span>অপরিশোধিত ({unpaidCount})</span>
                  </div>
                </button>
                <button onClick={() => handleSelectTab('billing-overdue')} className={subItemClass('billing-overdue')}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#801414]" />
                    <span>বকেয়া বিল ({overdueCount})</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Reminders */}
          <button onClick={() => handleSelectTab('reminders')} className={navItemClass('reminders')}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-700" />
              <span>ভাড়া রিমাইন্ডার (Reminders)</span>
            </div>
            {approachingReminders.length > 0 && (
              <span className="font-mono-data text-[10px] bg-amber-200 text-amber-900 border border-amber-400 px-1.5 py-0.2 font-bold rounded">
                {approachingReminders.length}
              </span>
            )}
          </button>

          {/* Payments */}
          <div className="pt-1">
            <button
              onClick={() => setPaymentsOpen(!paymentsOpen)}
              className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-mono-data font-bold text-[#141414]/60 uppercase tracking-wider border-b border-[#141414]/15"
            >
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>পেমেন্ট (Payments)</span>
              </div>
              {paymentsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {paymentsOpen && (
              <div className="space-y-0.5 mt-1">
                <button onClick={() => handleSelectTab('payments-add')} className={subItemClass('payments-add')}>
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>পেমেন্ট গ্রহণ (Add)</span>
                  </div>
                </button>
                <button onClick={() => handleSelectTab('payments-history')} className={subItemClass('payments-history')}>
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5" />
                    <span>পেমেন্ট ইতিহাস</span>
                  </div>
                </button>
                <button onClick={() => handleSelectTab('payments-receipts')} className={subItemClass('payments-receipts')}>
                  <div className="flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>রিসিটসমূহ</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Expenses */}
          <div className="pt-1">
            <button
              onClick={() => setExpensesOpen(!expensesOpen)}
              className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-mono-data font-bold text-[#141414]/60 uppercase tracking-wider border-b border-[#141414]/15"
            >
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                <span>খরচ (Expenses)</span>
              </div>
              {expensesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {expensesOpen && (
              <div className="space-y-0.5 mt-1">
                <button onClick={() => handleSelectTab('expenses-add')} className={subItemClass('expenses-add')}>
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-3.5 h-3.5 text-[#801414]" />
                    <span>খরচ যোগ (Add)</span>
                  </div>
                </button>
                <button onClick={() => handleSelectTab('expenses-history')} className={subItemClass('expenses-history')}>
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5" />
                    <span>খরচের তালিকা</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Cash Book */}
          <button onClick={() => handleSelectTab('cashbook')} className={navItemClass('cashbook')}>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#144A29]" />
              <span>ক্যাশ বুক (Cash Book)</span>
            </div>
            <span className="text-[10px] font-bold text-[#144A29] bg-[#D2E3D8] px-1 border border-[#144A29]/30">
              LIVE
            </span>
          </button>

          {/* Reports */}
          <div className="pt-1">
            <button
              onClick={() => setReportsOpen(!reportsOpen)}
              className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-mono-data font-bold text-[#141414]/60 uppercase tracking-wider border-b border-[#141414]/15"
            >
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>রিপোর্টসমূহ (Reports)</span>
              </div>
              {reportsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {reportsOpen && (
              <div className="space-y-0.5 mt-1">
                <button onClick={() => handleSelectTab('reports-income')} className={subItemClass('reports-income')}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-[#144A29]" />
                    <span>মাসিক আয় (Income)</span>
                  </div>
                </button>
                <button onClick={() => handleSelectTab('reports-expense')} className={subItemClass('reports-expense')}>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-3.5 h-3.5 text-[#801414]" />
                    <span>মাসিক খরচ (Expense)</span>
                  </div>
                </button>
                <button onClick={() => handleSelectTab('reports-profit-loss')} className={subItemClass('reports-profit-loss')}>
                  <div className="flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5" />
                    <span>লাভ-ক্ষতি (P&L)</span>
                  </div>
                </button>
                <button onClick={() => handleSelectTab('reports-due')} className={subItemClass('reports-due')}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#8C6600]" />
                    <span>বকেয়া রিপোর্ট</span>
                  </div>
                </button>
                <button onClick={() => handleSelectTab('reports-tenant-statement')} className={subItemClass('reports-tenant-statement')}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>ভাড়াটিয়া স্টেটমেন্ট</span>
                  </div>
                </button>
                <button onClick={() => handleSelectTab('reports-cashbook-statement')} className={subItemClass('reports-cashbook-statement')}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#144A29]" />
                    <span>ক্যাশ বুক স্টেটমেন্ট</span>
                  </div>
                </button>
                <button onClick={() => handleSelectTab('reports-yearly')} className={subItemClass('reports-yearly')}>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>বার্ষিক রিপোর্ট</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Users */}
          <button onClick={() => handleSelectTab('users')} className={navItemClass('users')}>
            <div className="flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              <span>ব্যবহারকারী ও রোল</span>
            </div>
          </button>

          {/* Activity Log */}
          <button onClick={() => handleSelectTab('activity-log')} className={navItemClass('activity-log')}>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>অ্যাক্টিভিটি লগ</span>
            </div>
          </button>

          {/* Settings */}
          <button onClick={() => handleSelectTab('settings')} className={navItemClass('settings')}>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>সেটিংস ও প্রপার্টি</span>
            </div>
          </button>
        </div>

        {/* Drawer Footer: PWA App Install Banner */}
        <div className="p-3 border-t border-[#141414]/20 bg-[#E4E3E0]">
          <PWAInstallButton variant="banner" />
        </div>
      </div>
    </div>
  );
};
