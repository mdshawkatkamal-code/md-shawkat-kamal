import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Payment } from '../../types';
import { formatCurrency, MONTHS_BN, formatDateBn } from '../../utils/formatters';
import { Printer, X, CheckCircle2, Mail, Send, Building2 } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  const { settings, bills } = useApp();
  const [emailSent, setEmailSent] = useState(false);

  // Associated bill (if any) to show total bill and due
  const associatedBill = payment.billId ? bills.find((b) => b.id === payment.billId) : null;
  const billTotal = associatedBill ? associatedBill.totalAmount : payment.amount;
  const dueAmount = associatedBill ? associatedBill.dueAmount : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#141414]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-[#F4F3F0] max-w-lg w-full p-5 sm:p-6 border-2 border-[#141414] shadow-2xl my-8">
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#141414]/20 no-print">
          <span className="text-[11px] font-mono-data font-bold uppercase text-[#141414] bg-[#DDDCD7] border border-[#141414]/30 px-2 py-0.5">
            অফিসিয়াল ডিজিটাল মানি রিসিট (Receipt)
          </span>

          <div className="flex items-center gap-2 font-mono-data">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#141414] hover:bg-[#2A2A28] text-[#E4E3E0] font-bold text-xs border border-[#141414] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট</span>
            </button>

            <button
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#DDDCD7] hover:bg-[#C8C7C2] text-[#141414] font-bold text-xs border border-[#141414]/40 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>ইমেইল</span>
            </button>

            <button onClick={onClose} className="text-[#141414] hover:bg-[#DDDCD7] p-1 border border-transparent hover:border-[#141414]/30 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {emailSent && (
          <div className="mt-3 p-2 bg-[#E2EFE7] border border-[#144A29] text-[#144A29] text-xs flex items-center gap-2 font-mono-data font-bold no-print">
            <CheckCircle2 className="w-4 h-4 text-[#144A29] shrink-0" />
            <span>মানি রিসিট ভাড়াটিয়ার ইমেইলে সফলভাবে পাঠানো হয়েছে!</span>
          </div>
        )}

        {/* Official Printable Money Receipt Content (Requirement 13) */}
        <div id="printable-receipt" className="py-4 space-y-3 text-xs">
          {/* Header Banner */}
          <div className="text-center pb-3 border-b-2 border-[#141414]">
            <h1 className="text-lg font-serif-heading font-bold text-[#141414] tracking-tight">
              {settings.propertyName}
            </h1>
            <p className="text-[11px] font-mono-data text-[#141414]/80">{settings.propertyAddress}</p>
            <p className="text-[11px] font-mono-data text-[#141414]/70">
              মোবাইল: {settings.propertyPhone} • ইমেইল: {settings.propertyEmail}
            </p>

            <div className="inline-block mt-2 px-3 py-0.5 bg-[#141414] text-[#E4E3E0] font-mono-data font-bold text-[11px] uppercase tracking-wider">
              ভাড়া ও ইউটিলিটি বিল প্রাপ্তি রশিদ (MONEY RECEIPT)
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-2 bg-[#EBEAE6] p-3 border border-[#141414]/30 font-mono-data">
            <div>
              <span className="text-[#141414]/60 text-[10px] uppercase">রসিদ নম্বর (Receipt No):</span>
              <p className="font-bold text-[#141414] text-xs">{payment.receiptNumber}</p>
            </div>
            <div>
              <span className="text-[#141414]/60 text-[10px] uppercase">পরিশোধের তারিখ (Date):</span>
              <p className="font-bold text-[#141414] text-xs">{payment.paymentDate}</p>
            </div>
            <div>
              <span className="text-[#141414]/60 text-[10px] uppercase">ভাড়াটিয়ার নাম (Tenant):</span>
              <p className="font-bold text-[#141414] text-xs font-sans">{payment.tenantName}</p>
            </div>
            <div>
              <span className="text-[#141414]/60 text-[10px] uppercase">ইউনিট নম্বর (Flat/Shop):</span>
              <p className="font-bold text-[#141414] text-xs">
                {payment.unitNumber} ({payment.unitType.toUpperCase()})
              </p>
            </div>
            <div className="col-span-2 pt-1 border-t border-[#141414]/20">
              <span className="text-[#141414]/60 text-[10px] uppercase">যে মাসের ভাড়া বাবদ (Payment For):</span>
              <p className="font-bold text-[#141414]">
                {MONTHS_BN[payment.month] || payment.month} {payment.year}
              </p>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border border-[#141414] overflow-hidden">
            <table className="w-full text-left text-xs font-mono-data">
              <thead className="bg-[#DDDCD7] font-bold text-[#141414] border-b border-[#141414]">
                <tr>
                  <th className="p-2 border-r border-[#141414]/20">বিবরণ</th>
                  <th className="p-2 text-right">পরিমাণ (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]/20 bg-[#F4F3F0]">
                <tr>
                  <td className="p-2 text-[#141414] border-r border-[#141414]/20">
                    মাসিক বিলের মোট পরিমাণ ({payment.month} {payment.year})
                  </td>
                  <td className="p-2 text-right font-bold text-[#141414]">
                    {formatCurrency(billTotal)}
                  </td>
                </tr>
                <tr className="bg-[#E2EFE7] font-bold text-[#144A29]">
                  <td className="p-2 border-r border-[#141414]/20">
                    আদায়কৃত / পরিশোধিত টাকা (Paid Amount)
                  </td>
                  <td className="p-2 text-right text-sm">
                    {formatCurrency(payment.amount)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-[#141414]/80 border-r border-[#141414]/20">অবশিষ্ট বকেয়া (Current Due)</td>
                  <td className="p-2 text-right font-bold text-[#801414]">
                    {formatCurrency(dueAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Method & Received By */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-[#EBEAE6] p-2.5 border border-[#141414]/30 font-mono-data">
            <div>
              <span className="text-[#141414]/60 text-[10px] uppercase">পেমেন্ট মাধ্যম:</span>
              <p className="font-bold text-[#141414] uppercase">{payment.paymentMethod}</p>
              {payment.reference && (
                <p className="text-[10px] text-[#141414]/70">রেফারেন্স: {payment.reference}</p>
              )}
            </div>
            <div>
              <span className="text-[#141414]/60 text-[10px] uppercase">টাকা গ্রহণকারী (Received By):</span>
              <p className="font-bold text-[#141414]">{payment.receivedBy}</p>
            </div>
          </div>

          {/* Signatures & Stamp */}
          <div className="pt-6 grid grid-cols-2 gap-6 text-center text-xs font-mono-data">
            <div>
              <div className="border-t border-[#141414] pt-1 font-semibold text-[#141414]">
                ভাড়াটিয়ার স্বাক্ষর
              </div>
            </div>
            <div>
              <div className="border-t border-[#141414] pt-1 font-bold text-[#141414]">
                কর্তৃপক্ষের স্বাক্ষর ও সিল
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] font-mono-data text-[#141414]/50 pt-2 border-t border-[#141414]/10">
            ডিজিটাল মানি রিসিট • {settings.propertyName}
          </div>
        </div>
      </div>
    </div>
  );
};
