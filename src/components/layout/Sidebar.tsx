import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  Shield,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, bills } = useApp();
  const isOwner = currentUser.role === 'owner';

  // Section collapse states
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [billingOpen, setBillingOpen] = useState(true);
  const [paymentsOpen, setPaymentsOpen] = useState(true);
  const [expensesOpen, setExpensesOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(true);

  // Bill badges
  const unpaidCount = bills.filter((b) => b.status === 'unpaid' || b.status === 'partial').length;
  const overdueCount = bills.filter((b) => b.status === 'overdue' || (b.dueAmount > 0 && b.month !== 'August')).length;

  const navItemClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `flex items-center justify-between w-full px-2.5 py-1.5 text-xs font-mono-data font-semibold border transition-all cursor-pointer ${
      isActive
        ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
        : 'text-[#141414] bg-transparent border-transparent hover:bg-[#DDDCD7] hover:border-[#141414]/20'
    }`;
  };

  const subItemClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `flex items-center justify-between w-full pl-6 pr-2.5 py-1 text-xs font-mono-data font-medium border transition-all cursor-pointer ${
      isActive
        ? 'bg-[#DDDCD7] text-[#141414] font-bold border-[#141414] border-l-2'
        : 'text-[#141414]/80 bg-transparent border-transparent hover:bg-[#DDDCD7]/60 hover:text-[#141414]'
    }`;
  };

  return (
    <aside className="w-64 bg-[#EBEAE6] border-r border-[#141414] min-h-[calc(100vh-3.5rem)] flex flex-col justify-between p-2.5 shrink-0 select-none">
      <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-6rem)] pr-1 custom-scrollbar">
        {/* 1. Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={navItemClass('dashboard')}
        >
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>ড্যাশবোর্ড (Dashboard)</span>
          </div>
        </button>

        {/* 2. Properties (Flats, Shops) */}
        <div className="pt-1.5">
          <button
            onClick={() => setPropertiesOpen(!propertiesOpen)}
            className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-mono-data font-bold text-[#141414]/60 hover:text-[#141414] uppercase tracking-wider border-b border-[#141414]/15"
          >
            <div className="flex items-center gap-1.5">
              <Building className="w-3 h-3" />
              <span>সম্পত্তি (Properties)</span>
            </div>
            {propertiesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {propertiesOpen && (
            <div className="space-y-0.5 mt-1">
              <button onClick={() => setActiveTab('flats')} className={subItemClass('flats')}>
                <div className="flex items-center gap-2">
                  <Home className="w-3.5 h-3.5" />
                  <span>ফ্ল্যাটসমূহ (Flats)</span>
                </div>
                <span className="font-mono-data text-[10px] bg-[#DDDCD7] px-1 border border-[#141414]/20 text-[#141414]">80</span>
              </button>
              <button onClick={() => setActiveTab('shops')} className={subItemClass('shops')}>
                <div className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5" />
                  <span>দোকানসমূহ (Shops)</span>
                </div>
                <span className="font-mono-data text-[10px] bg-[#DDDCD7] px-1 border border-[#141414]/20 text-[#141414]">20</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Tenants */}
        <button onClick={() => setActiveTab('tenants')} className={navItemClass('tenants')}>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            <span>ভাড়াটিয়া (Tenants)</span>
          </div>
          <span className="font-mono-data text-[10px] bg-[#DDDCD7] text-[#141414] border border-[#141414]/30 px-1 py-0.2">
            Profiles
          </span>
        </button>

        {/* 4. Billing (Generate, Monthly, Unpaid, Overdue) */}
        <div className="pt-1.5">
          <button
            onClick={() => setBillingOpen(!billingOpen)}
            className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-mono-data font-bold text-[#141414]/60 hover:text-[#141414] uppercase tracking-wider border-b border-[#141414]/15"
          >
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-3 h-3" />
              <span>বিলিং (Billing)</span>
            </div>
            {billingOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {billingOpen && (
            <div className="space-y-0.5 mt-1">
              <button onClick={() => setActiveTab('billing-generate')} className={subItemClass('billing-generate')}>
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-3.5 h-3.5 text-[#144A29]" />
                  <span>বিল তৈরি (Generate)</span>
                </div>
              </button>
              <button onClick={() => setActiveTab('billing-monthly')} className={subItemClass('billing-monthly')}>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>মাসিক বিল (Monthly)</span>
                </div>
              </button>
              <button onClick={() => setActiveTab('billing-unpaid')} className={subItemClass('billing-unpaid')}>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#8C6600]" />
                  <span>অপরিশোধিত (Unpaid)</span>
                </div>
                {unpaidCount > 0 && (
                  <span className="font-mono-data text-[10px] bg-[#EBDCB2] text-[#5C4300] border border-[#8C6600]/40 px-1">
                    {unpaidCount}
                  </span>
                )}
              </button>
              <button onClick={() => setActiveTab('billing-overdue')} className={subItemClass('billing-overdue')}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-[#801414]" />
                  <span>বকেয়া বিল (Overdue)</span>
                </div>
                {overdueCount > 0 && (
                  <span className="font-mono-data text-[10px] bg-[#F5D5D5] text-[#801414] border border-[#801414]/30 px-1 font-bold">
                    {overdueCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 5. Payments (Add Payment, Payment History, Receipts) */}
        <div className="pt-1.5">
          <button
            onClick={() => setPaymentsOpen(!paymentsOpen)}
            className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-mono-data font-bold text-[#141414]/60 hover:text-[#141414] uppercase tracking-wider border-b border-[#141414]/15"
          >
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3 h-3" />
              <span>পেমেন্ট (Payments)</span>
            </div>
            {paymentsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {paymentsOpen && (
            <div className="space-y-0.5 mt-1">
              <button onClick={() => setActiveTab('payments-add')} className={subItemClass('payments-add')}>
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>পেমেন্ট গ্রহণ (Add)</span>
                </div>
              </button>
              <button onClick={() => setActiveTab('payments-history')} className={subItemClass('payments-history')}>
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5" />
                  <span>পেমেন্ট ইতিহাস (History)</span>
                </div>
              </button>
              <button onClick={() => setActiveTab('payments-receipts')} className={subItemClass('payments-receipts')}>
                <div className="flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>রিসিটসমূহ (Receipts)</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 6. Expenses (Add Expense, Expense History) */}
        <div className="pt-1.5">
          <button
            onClick={() => setExpensesOpen(!expensesOpen)}
            className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-mono-data font-bold text-[#141414]/60 hover:text-[#141414] uppercase tracking-wider border-b border-[#141414]/15"
          >
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3 h-3" />
              <span>খরচ (Expenses)</span>
            </div>
            {expensesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {expensesOpen && (
            <div className="space-y-0.5 mt-1">
              <button onClick={() => setActiveTab('expenses-add')} className={subItemClass('expenses-add')}>
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-3.5 h-3.5 text-[#801414]" />
                  <span>খরচ যোগ (Add)</span>
                </div>
              </button>
              <button onClick={() => setActiveTab('expenses-history')} className={subItemClass('expenses-history')}>
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5" />
                  <span>খরচের তালিকা (History)</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 7. Cash Book */}
        <button onClick={() => setActiveTab('cashbook')} className={navItemClass('cashbook')}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#144A29]" />
            <span>ক্যাশ বুক (Cash Book)</span>
          </div>
          <span className="font-mono-data text-[10px] font-bold text-[#144A29] bg-[#D2E3D8] border border-[#144A29]/30 px-1 py-0.2">
            LIVE
          </span>
        </button>

        {/* 8. Reports */}
        <div className="pt-1.5">
          <button
            onClick={() => setReportsOpen(!reportsOpen)}
            className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-mono-data font-bold text-[#141414]/60 hover:text-[#141414] uppercase tracking-wider border-b border-[#141414]/15"
          >
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3" />
              <span>রিপোর্টসমূহ (Reports)</span>
            </div>
            {reportsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {reportsOpen && (
            <div className="space-y-0.5 mt-1">
              <button onClick={() => setActiveTab('reports-income')} className={subItemClass('reports-income')}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#144A29]" />
                  <span>মাসিক আয় (Income)</span>
                </div>
              </button>
              <button onClick={() => setActiveTab('reports-expense')} className={subItemClass('reports-expense')}>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5 text-[#801414]" />
                  <span>মাসিক খরচ (Expense)</span>
                </div>
              </button>
              <button onClick={() => setActiveTab('reports-profit-loss')} className={subItemClass('reports-profit-loss')}>
                <div className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5" />
                  <span>লাভ-ক্ষতি (Profit/Loss)</span>
                </div>
              </button>
              <button onClick={() => setActiveTab('reports-due')} className={subItemClass('reports-due')}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-[#8C6600]" />
                  <span>বকেয়া রিপোর্ট (Due)</span>
                </div>
              </button>
              <button onClick={() => setActiveTab('reports-tenant-statement')} className={subItemClass('reports-tenant-statement')}>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>ভাড়াটিয়া স্টেটমেন্ট</span>
                </div>
              </button>
              <button onClick={() => setActiveTab('reports-yearly')} className={subItemClass('reports-yearly')}>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>বার্ষিক রিপোর্ট (Yearly)</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 9. Users (Owner only) */}
        <div className="pt-1.5">
          {isOwner ? (
            <button onClick={() => setActiveTab('users')} className={navItemClass('users')}>
              <div className="flex items-center gap-2">
                <UserCog className="w-3.5 h-3.5" />
                <span>ব্যবহারকারী (Users)</span>
              </div>
              <span className="font-mono-data text-[9px] bg-[#DDDCD7] text-[#141414] border border-[#141414]/30 px-1 py-0.2 uppercase">
                Owner
              </span>
            </button>
          ) : (
            <div className="px-2.5 py-1.5 text-xs text-[#141414]/40 flex items-center justify-between border border-dashed border-[#141414]/20 bg-[#DDDCD7]/30 cursor-not-allowed">
              <div className="flex items-center gap-2">
                <UserCog className="w-3.5 h-3.5 opacity-50" />
                <span>ব্যবহারকারী (Users)</span>
              </div>
              <Shield className="w-3 h-3 text-[#141414]/40" />
            </div>
          )}
        </div>

        {/* 10. Activity Log */}
        <button onClick={() => setActiveTab('activity-log')} className={navItemClass('activity-log')}>
          <div className="flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            <span>অ্যাক্টিভিটি লগ (Logs)</span>
          </div>
        </button>

        {/* 11. Settings (Owner only) */}
        {isOwner ? (
          <button onClick={() => setActiveTab('settings')} className={navItemClass('settings')}>
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" />
              <span>সেটিংস (Settings)</span>
            </div>
          </button>
        ) : (
          <div className="px-2.5 py-1.5 text-xs text-[#141414]/40 flex items-center justify-between border border-dashed border-[#141414]/20 bg-[#DDDCD7]/30 cursor-not-allowed">
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 opacity-50" />
              <span>সেটিংস (Settings)</span>
            </div>
            <Shield className="w-3 h-3 text-[#141414]/40" />
          </div>
        )}
      </div>

      {/* Footer Role Notice */}
      <div className="pt-2.5 mt-2 border-t border-[#141414]/20 font-mono-data text-[11px] text-[#141414]">
        <div className="flex items-center justify-between">
          <span className="font-bold truncate">{currentUser.name}</span>
          <span
            className={`px-1 py-0.2 text-[10px] font-bold border ${
              isOwner
                ? 'bg-[#EBDCB2] text-[#5C4300] border-[#8C6600]/40'
                : 'bg-[#D2E3D8] text-[#144A29] border-[#144A29]/30'
            }`}
          >
            {currentUser.role.toUpperCase()}
          </span>
        </div>
        <p className="text-[10px] text-[#141414]/60 mt-1 font-sans">
          {isOwner
            ? 'পূর্ণ নিয়ন্ত্রণ ও রিপোর্ট সুবিধা সক্রিয়'
            : 'ম্যানেজার অ্যাক্সেস (এন্ট্রি ও বিলিং)'}
        </p>
      </div>
    </aside>
  );
};
