import React from 'react';
import { useApp } from '../../context/AppContext';
import { Tenant } from '../../types';
import { formatCurrency, MONTHS_BN } from '../../utils/formatters';
import { Printer, X, FileText, User, Building2 } from 'lucide-react';

interface StatementModalProps {
  data: {
    tenant: Tenant;
    month: string;
    year: number;
  };
  onClose: () => void;
}

export const StatementModal: React.FC<StatementModalProps> = ({ data, onClose }) => {
  const { tenant, month, year } = data;
  const { settings, bills, payments } = useApp();

  // Find bills and payments for this tenant and month/all-time
  const monthlyBill = bills.find(
    (b) => b.tenantId === tenant.id && b.month === month && b.year === year
  );
  const monthlyPayments = payments.filter(
    (p) => p.tenantId === tenant.id && p.month === month && p.year === year
  );

  const totalBill = monthlyBill ? monthlyBill.totalAmount : tenant.monthlyRent;
  const totalPaid = monthlyPayments.reduce((acc, p) => acc + p.amount, 0);
  const dueAmount = monthlyBill ? monthlyBill.dueAmount : Math.max(0, totalBill - totalPaid);

  return (
    <div className="fixed inset-0 z-50 bg-[#141414]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-mono-data">
      <div className="bg-[#F4F3F0] max-w-2xl w-full p-5 border border-[#141414] my-8 shadow-xl">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#141414]/20 no-print">
          <span className="text-xs font-bold uppercase text-[#141414] bg-[#DDDCD7] border border-[#141414]/40 px-2.5 py-0.5">
            ভাড়াটিয়া মাসিক হিসাব বিবরণী (Tenant Statement)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141414] hover:bg-[#2A2A28] text-[#E4E3E0] font-bold text-xs border border-[#141414] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট স্টেটমেন্ট</span>
            </button>
            <button onClick={onClose} className="text-[#141414]/60 hover:text-[#141414] p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document (Requirement 15) */}
        <div id="printable-statement" className="py-4 space-y-3.5 text-xs text-[#141414]">
          {/* Header */}
          <div className="text-center pb-3 border-b border-[#141414]">
            <h1 className="text-lg font-serif-heading font-bold text-[#141414]">{settings.propertyName}</h1>
            <p className="text-[11px] text-[#141414]/80">{settings.propertyAddress}</p>
            <p className="text-[11px] text-[#141414]/60">
              যোগাযোগ: {settings.propertyPhone} • {settings.propertyEmail}
            </p>

            <div className="inline-block mt-2.5 px-3 py-0.5 bg-[#EBEAE6] border border-[#141414] text-[#141414] font-bold text-xs">
              মাসিক হিসাব বিবরণী (TENANT MONTHLY STATEMENT) — {MONTHS_BN[month]} {year}
            </div>
          </div>

          {/* Tenant Details Info Box */}
          <div className="grid grid-cols-2 gap-3 bg-[#EBEAE6] p-3 border border-[#141414]/40">
            <div>
              <span className="text-[#141414]/60 text-[11px]">ভাড়াটিয়ার নাম:</span>
              <p className="font-bold text-[#141414] text-xs">{tenant.name}</p>
              <p className="text-[11px] text-[#141414]/70">মোবাইল: {tenant.phone}</p>
            </div>
            <div>
              <span className="text-[#141414]/60 text-[11px]">বরাদ্দকৃত ইউনিট:</span>
              <p className="font-bold text-[#141414] text-xs">
                {tenant.unitNumber} ({tenant.unitType.toUpperCase()})
              </p>
              <p className="text-[11px] text-[#141414]/70">এনআইডি: {tenant.nid}</p>
            </div>
          </div>

          {/* 3 Large Highlight Metrics */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-[#EBEAE6] p-2.5 border border-[#141414]/40">
              <span className="text-[10px] font-bold text-[#141414]/70 uppercase">মোট বিল (Total Bill)</span>
              <div className="text-sm font-bold text-[#141414] mt-0.5">
                {formatCurrency(totalBill)}
              </div>
            </div>
            <div className="bg-[#E0F2E9] p-2.5 border border-[#141414]">
              <span className="text-[10px] font-bold text-[#14532D] uppercase">মোট পরিশোধ (Paid)</span>
              <div className="text-sm font-bold text-[#14532D] mt-0.5">
                {formatCurrency(totalPaid)}
              </div>
            </div>
            <div className="bg-[#FCE8E8] p-2.5 border border-[#801414]">
              <span className="text-[10px] font-bold text-[#801414] uppercase">বকেয়া স্থিতি (Due)</span>
              <div className="text-sm font-bold text-[#801414] mt-0.5">
                {formatCurrency(dueAmount)}
              </div>
            </div>
          </div>

          {/* Monthly Bill Items Breakdown */}
          {monthlyBill && (
            <div className="border border-[#141414] overflow-hidden">
              <div className="bg-[#EBEAE6] px-3 py-1.5 font-bold text-[#141414] text-[11px] border-b border-[#141414]">
                বিলের বিস্তারিত বিভাজন (Bill Breakdown)
              </div>
              <table className="w-full text-left text-xs tech-grid-table">
                <tbody className="divide-y divide-[#141414]/15">
                  <tr>
                    <td className="p-2 text-[#141414]/80">মূল বাড়ি / দোকান ভাড়া</td>
                    <td className="p-2 text-right font-bold">{formatCurrency(monthlyBill.items.rent)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-[#141414]/80">বিদ্যুৎ বিল</td>
                    <td className="p-2 text-right">{formatCurrency(monthlyBill.items.electricity)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-[#141414]/80">পানি বিল</td>
                    <td className="p-2 text-right">{formatCurrency(monthlyBill.items.water)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-[#141414]/80">গ্যাস বিল</td>
                    <td className="p-2 text-right">{formatCurrency(monthlyBill.items.gas)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-[#141414]/80">সার্ভিস চার্জ</td>
                    <td className="p-2 text-right">{formatCurrency(monthlyBill.items.serviceCharge)}</td>
                  </tr>
                  {monthlyBill.items.other > 0 && (
                    <tr>
                      <td className="p-2 text-[#141414]/80">অন্যান্য চার্জ</td>
                      <td className="p-2 text-right">{formatCurrency(monthlyBill.items.other)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Payments for this month */}
          <div className="border border-[#141414] overflow-hidden">
            <div className="bg-[#EBEAE6] px-3 py-1.5 font-bold text-[#141414] text-[11px] border-b border-[#141414]">
              পরিশোধিত পেমেন্টের তালিকা (Payment Records)
            </div>
            {monthlyPayments.length === 0 ? (
              <div className="p-3 text-center text-[#141414]/50 text-[11px]">
                এই মাসে কোন পেমেন্ট রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              <table className="w-full text-left text-xs tech-grid-table">
                <thead className="bg-[#EBEAE6] border-b border-[#141414] text-[#141414] font-bold">
                  <tr>
                    <th className="p-2">রিসিট নং</th>
                    <th className="p-2">তারিখ</th>
                    <th className="p-2">মাধ্যম</th>
                    <th className="p-2 text-right">আদায়কৃত টাকা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/15">
                  {monthlyPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="p-2 font-bold text-[#141414]">{p.receiptNumber}</td>
                      <td className="p-2 text-[#141414]/80">{p.paymentDate}</td>
                      <td className="p-2 uppercase text-[#141414]/80">{p.paymentMethod}</td>
                      <td className="p-2 text-right font-bold text-[#14532D]">
                        +{formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-t border-[#141414] pt-1 font-bold text-[#141414]">
                ভাড়াটিয়ার স্বাক্ষর
              </div>
            </div>
            <div>
              <div className="border-t border-[#141414] pt-1 font-bold text-[#141414]">
                প্রোপার্টি ম্যানেজার / মালিকের স্বাক্ষর
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
