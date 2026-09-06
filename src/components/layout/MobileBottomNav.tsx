import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileSpreadsheet,
  BookOpen,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const { activeTab, setActiveTab, bills } = useApp();

  const isBilling = activeTab.startsWith('billing');
  const isProperties = activeTab === 'flats' || activeTab === 'shops';
  const isCashOrPay = activeTab === 'cashbook' || activeTab.startsWith('payments') || activeTab.startsWith('expenses');

  const unpaidCount = bills.filter((b) => b.status === 'unpaid' || b.status === 'partial').length;

  const btnClass = (isActive: boolean) =>
    `flex-1 flex flex-col items-center justify-center py-2 px-1 text-[10px] font-mono-data font-semibold transition-colors relative cursor-pointer ${
      isActive
        ? 'text-[#141414] bg-[#DDDCD7] font-bold border-t-2 border-[#141414]'
        : 'text-[#141414]/70 hover:text-[#141414] hover:bg-[#EBEAE6]'
    }`;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#F4F3F0] border-t border-[#141414] shadow-lg flex lg:hidden items-stretch h-14 select-none pb-[env(safe-area-inset-bottom)]">
      {/* 1. Dashboard */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={btnClass(activeTab === 'dashboard')}
      >
        <LayoutDashboard className="w-4 h-4 mb-0.5" />
        <span>ড্যাশবোর্ড</span>
      </button>

      {/* 2. Flats & Shops */}
      <button
        onClick={() => setActiveTab('flats')}
        className={btnClass(isProperties)}
      >
        <Building2 className="w-4 h-4 mb-0.5" />
        <span>ফ্ল্যাট/দোকান</span>
      </button>

      {/* 3. Tenants */}
      <button
        onClick={() => setActiveTab('tenants')}
        className={btnClass(activeTab === 'tenants')}
      >
        <Users className="w-4 h-4 mb-0.5" />
        <span>ভাড়াটিয়া</span>
      </button>

      {/* 4. Billing */}
      <button
        onClick={() => setActiveTab('billing-monthly')}
        className={btnClass(isBilling)}
      >
        <div className="relative">
          <FileSpreadsheet className="w-4 h-4 mb-0.5" />
          {unpaidCount > 0 && (
            <span className="absolute -top-1 -right-2.5 w-3.5 h-3.5 bg-[#801414] text-[#E4E3E0] rounded-full text-[9px] flex items-center justify-center font-bold">
              {unpaidCount > 9 ? '9+' : unpaidCount}
            </span>
          )}
        </div>
        <span>বিলিং</span>
      </button>

      {/* 5. Cash Book */}
      <button
        onClick={() => setActiveTab('cashbook')}
        className={btnClass(isCashOrPay)}
      >
        <BookOpen className="w-4 h-4 mb-0.5" />
        <span>ক্যাশ বুক</span>
      </button>

      {/* 6. More / Drawer Menu */}
      <button
        onClick={onOpenMenu}
        className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-[10px] font-mono-data font-semibold text-[#141414]/80 hover:text-[#141414] hover:bg-[#EBEAE6] transition-colors cursor-pointer"
      >
        <Menu className="w-4 h-4 mb-0.5" />
        <span>মেনু</span>
      </button>
    </nav>
  );
};
