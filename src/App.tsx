import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { FlatsView } from './components/properties/FlatsView';
import { ShopsView } from './components/properties/ShopsView';
import { TenantsView } from './components/tenants/TenantsView';
import { BillingView } from './components/billing/BillingView';
import { PaymentsView } from './components/payments/PaymentsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { CashBookView } from './components/cashbook/CashBookView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { ActivityLogView } from './components/activity/ActivityLogView';
import { SettingsView } from './components/settings/SettingsView';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { StatementModal } from './components/modals/StatementModal';

const MainContent: React.FC = () => {
  const {
    activeTab,
    selectedReceiptModal,
    setSelectedReceiptModal,
    selectedStatementModal,
    setSelectedStatementModal,
  } = useApp();

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;

      case 'flats':
        return <FlatsView />;

      case 'shops':
        return <ShopsView />;

      case 'tenants':
        return <TenantsView />;

      case 'billing-generate':
        return <BillingView initialSubTab="generate" />;
      case 'billing-monthly':
        return <BillingView initialSubTab="monthly" />;
      case 'billing-unpaid':
        return <BillingView initialSubTab="unpaid" />;
      case 'billing-overdue':
        return <BillingView initialSubTab="overdue" />;

      case 'payments-add':
        return <PaymentsView initialSubTab="add" />;
      case 'payments-history':
        return <PaymentsView initialSubTab="history" />;
      case 'payments-receipts':
        return <PaymentsView initialSubTab="receipts" />;

      case 'expenses-add':
        return <ExpensesView initialSubTab="add" />;
      case 'expenses-history':
        return <ExpensesView initialSubTab="history" />;

      case 'cashbook':
        return <CashBookView />;

      case 'reports-income':
        return <ReportsView initialReportType="income" />;
      case 'reports-expense':
        return <ReportsView initialReportType="expense" />;
      case 'reports-profit-loss':
        return <ReportsView initialReportType="profit_loss" />;
      case 'reports-due':
        return <ReportsView initialReportType="due" />;
      case 'reports-tenant-statement':
        return <ReportsView initialReportType="tenant_statement" />;
      case 'reports-yearly':
        return <ReportsView initialReportType="yearly" />;

      case 'users':
        return <UsersView />;

      case 'activity-log':
        return <ActivityLogView />;

      case 'settings':
        return <SettingsView />;

      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex flex-col text-[#141414] font-sans antialiased">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex-1 flex overflow-hidden border-t border-[#141414]/20">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 bg-[#E4E3E0]">
          <div className="max-w-[1600px] mx-auto">{renderView()}</div>
        </main>
      </div>

      {/* Global Modals */}
      {selectedReceiptModal && (
        <ReceiptModal
          payment={selectedReceiptModal}
          onClose={() => setSelectedReceiptModal(null)}
        />
      )}

      {selectedStatementModal && (
        <StatementModal
          data={selectedStatementModal}
          onClose={() => setSelectedStatementModal(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
