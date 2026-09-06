import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppSettings } from '../../types';
import { MONTHS, MONTHS_BN } from '../../utils/formatters';
import {
  Settings as SettingsIcon,
  Building2,
  Phone,
  Mail,
  Calendar,
  Save,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
  Bell,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDefaultData,
    clearMonthData,
    selectedMonth,
    selectedYear,
    currentUser,
    setActiveTab,
  } = useApp();
  const isOwner = currentUser.role === 'owner';

  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [monthToClear, setMonthToClear] = useState<string>(selectedMonth);
  const [yearToClear, setYearToClear] = useState<number>(selectedYear);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    confetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.6 },
    });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Export full JSON backup
  const handleExportBackup = () => {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('prms_')) {
        try {
          backupData[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          backupData[key] = localStorage.getItem(key);
        }
      }
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `PRMS_Backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        Object.keys(json).forEach((key) => {
          if (key.startsWith('prms_')) {
            localStorage.setItem(key, JSON.stringify(json[key]));
          }
        });
        alert('ডেটা সফলভাবে রিস্টোর হয়েছে! পেজটি রিলোড হচ্ছে...');
        window.location.reload();
      } catch (err) {
        alert('ত্রুটি: ব্যাকআপ ফাইলটি সঠিক নয়।');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      confirm(
        'সতর্কতা: আপনি কি নিশ্চিত যে সমস্ত ডেটা মুছে প্রারম্ভিক ৮০টি ফ্ল্যাট ও ২০টি দোকানের ডেমো ডেটায় ফিরে যেতে চান?'
      )
    ) {
      resetToDefaultData();
      alert('সিস্টেম সফলভাবে প্রাথমিক ডেমো ডেটায় রিসেট হয়েছে!');
    }
  };

  const handleClearMonth = () => {
    const monthNameBn = MONTHS_BN[monthToClear] || monthToClear;
    if (
      confirm(
        `সতর্কতা: আপনি কি নিশ্চিত যে ${monthNameBn} ${yearToClear} মাসের সমস্ত বিল, আদায় ও খরচের হিসাব ০ (রিসেট) করতে চান? ফ্ল্যাট, দোকান ও ভাড়াটিয়া অক্ষত থাকবে।`
      )
    ) {
      clearMonthData(monthToClear, yearToClear);
      alert(`${monthNameBn} ${yearToClear} মাসের বিল ও খরচের হিসাব সফলভাবে ০ করা হয়েছে!`);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#141414]" />
            <span>প্রপার্টি ও সিস্টেম সেটিংস (System Settings)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            ভবনের নাম, ঠিকানা, ডিফল্ট বিলিং নিয়ম ও ডেটা ব্যাকআপ-রিস্টোর কনফিগারেশন
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-[#E0F2E9] border border-[#141414] p-2.5 flex items-center gap-2 text-xs font-bold text-[#14532D] font-mono-data">
          <CheckCircle2 className="w-4 h-4 text-[#14532D]" />
          <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-[#F4F3F0] p-5 border border-[#141414] space-y-4 text-xs font-mono-data">
        <h3 className="text-sm font-serif-heading font-bold text-[#141414] pb-2 border-b border-[#141414]/20 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#141414]" />
          <span>ভবন ও প্রপার্টির সাধারণ তথ্য</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-bold text-[#141414] mb-1">ভবন / প্রপার্টির নাম *</label>
            <input
              type="text"
              required
              value={formData.propertyName}
              onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#141414] mb-1">ভবনের পূর্ণ ঠিকানা *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-medium text-[#141414] outline-none focus:border-[#141414]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#141414] mb-1">অফিসিয়াল যোগাযোগ মোবাইল</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-medium text-[#141414] outline-none focus:border-[#141414]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#141414] mb-1">অফিসিয়াল ইমেইল</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-medium text-[#141414] outline-none focus:border-[#141414]"
            />
          </div>
        </div>

        <h3 className="text-sm font-serif-heading font-bold text-[#141414] pt-3 pb-2 border-b border-[#141414]/20 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#141414]" />
          <span>বিলিং ও বকেয়া জরিমানা পলিসি</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block font-bold text-[#141414] mb-1">
              মাসিক বিল পরিশোধের শেষ দিন (Due Day)
            </label>
            <input
              type="number"
              min="1"
              max="28"
              value={formData.defaultRentDueDate}
              onChange={(e) => setFormData({ ...formData, defaultRentDueDate: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414]"
            />
            <span className="text-[10px] text-[#141414]/60 mt-0.5 block">প্রতি মাসের ১০ তারিখ ডিফল্ট</span>
          </div>

          <div>
            <label className="block font-bold text-[#141414] mb-1">
              বিলম্ব ফি / লেট ফাইন (প্রতিদিন ৳)
            </label>
            <input
              type="number"
              min="0"
              value={formData.lateFee}
              onChange={(e) => setFormData({ ...formData, lateFee: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#141414] mb-1">মুদ্রা প্রতীক (Currency)</label>
            <input
              type="text"
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414]"
            />
          </div>
        </div>

        {/* Automatic Reminders & SMS Settings Section */}
        <h3 className="text-sm font-serif-heading font-bold text-[#141414] pt-3 pb-2 border-b border-[#141414]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-800" />
            <span>স্বয়ংক্রিয় এসএমএস ও নোটিফিকেশন রিমাইন্ডার (Automatic Reminders)</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('reminders')}
            className="text-xs font-mono-data font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            <span>সম্পূর্ণ রিমাইন্ডার মডিউলে যান</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </h3>

        <div className="p-3 bg-[#EBEAE6] border border-[#141414]/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-[#141414]">স্বয়ংক্রিয় রিমাইন্ডার ইঞ্জিন সক্রিয়</span>
              <p className="text-[11px] text-[#141414]/70">ভাড়া পরিশোধের তারিখের পূর্বে স্বয়ংক্রিয়ভাবে নোটিশ তৈরি করবে</p>
            </div>
            <input
              type="checkbox"
              checked={formData.reminderSettings?.enabled ?? true}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reminderSettings: {
                    ...(formData.reminderSettings || {}),
                    enabled: e.target.checked,
                  } as any,
                })
              }
              className="w-4 h-4 text-emerald-700 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#141414]/10">
            <label className="flex items-center gap-2 text-xs font-medium text-[#141414] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.reminderSettings?.notifyInApp ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reminderSettings: {
                      ...(formData.reminderSettings || {}),
                      notifyInApp: e.target.checked,
                    } as any,
                  })
                }
                className="w-3.5 h-3.5 text-emerald-700"
              />
              <span>ইন-অ্যাপ নোটিফিকেশন অ্যালার্ট সক্রিয়</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-[#141414] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.reminderSettings?.notifySMS ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reminderSettings: {
                      ...(formData.reminderSettings || {}),
                      notifySMS: e.target.checked,
                    } as any,
                  })
                }
                className="w-3.5 h-3.5 text-emerald-700"
              />
              <span>মোবাইল SMS বার্তা প্রেরণ সক্রিয়</span>
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#141414] hover:bg-[#2A2A28] text-[#E4E3E0] font-bold border border-[#141414] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>সেটিংস পরিবর্তন সংরক্ষণ করুন</span>
          </button>
        </div>
      </form>

      {/* Backup, Restore & Reset Section */}
      <div className="bg-[#F4F3F0] p-5 border border-[#141414] space-y-3.5 text-xs font-mono-data">
        <h3 className="text-sm font-serif-heading font-bold text-[#141414] pb-2 border-b border-[#141414]/20 flex items-center gap-2">
          <Download className="w-4 h-4 text-[#141414]" />
          <span>ডেটা ব্যাকআপ, রিস্টোর ও রিসেট ব্যবস্থাপনা</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-3.5 bg-[#EBEAE6] border border-[#141414]/40 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-[#141414] mb-1">JSON ব্যাকআপ ডাউনলোড</h4>
              <p className="text-[11px] text-[#141414]/70">
                সকল ফ্ল্যাট, দোকান, ভাড়াটিয়া ও বিলের পূর্ণাঙ্গ ডেটা এক ক্লিকে সেভ করুন।
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#2A2A28] text-[#E4E3E0] font-bold border border-[#141414] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Full JSON</span>
            </button>
          </div>

          <div className="p-3.5 bg-[#EBEAE6] border border-[#141414]/40 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-[#141414] mb-1">ব্যাকআপ ফাইল রিস্টোর</h4>
              <p className="text-[11px] text-[#141414]/70">
                পূর্বে সেভ করা JSON ব্যাকআপ ফাইল থেকে সম্পূর্ণ সিস্টেম রিস্টোর করুন।
              </p>
            </div>
            <label className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#DDDCD7] hover:bg-[#C8C7C2] text-[#141414] font-bold border border-[#141414] cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-3.5 bg-[#FCE8E8] border border-[#801414] flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-[#801414] mb-1">ডেমো ডেটা রিসেট</h4>
              <p className="text-[11px] text-[#801414]/80">
                সিস্টেমের সকল ৮০টি ফ্ল্যাট ও ২০টি দোকানের প্রাথমিক ডেমো ডেটায় ফিরে যান।
              </p>
            </div>
            <button
              onClick={handleReset}
              className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#801414] hover:bg-[#5C0E0E] text-white font-bold border border-[#801414] cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset to Seed Data</span>
            </button>
          </div>
        </div>

        {/* Month-specific clear section */}
        <div className="mt-4 p-4 bg-[#FFF8EE] border border-[#B38000]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-[#805000] flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-[#805000]" />
              <span>নির্দিষ্ট মাসের বিল ও খরচের হিসাব ০ (রিসেট) করুন</span>
            </h4>
            <p className="text-[11px] text-[#805000]/80 mt-0.5">
              নির্বাচিত মাসের সমস্ত বিল, আদায় ও খরচের হিসাব ০ হয়ে যাবে। ফ্ল্যাট, দোকান ও ভাড়াটিয়ার তালিকা সম্পূর্ণ সংরক্ষিত থাকবে।
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={monthToClear}
              onChange={(e) => setMonthToClear(e.target.value)}
              className="px-2 py-1.5 bg-white border border-[#141414]/40 font-bold text-xs"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {MONTHS_BN[m]}
                </option>
              ))}
            </select>
            <select
              value={yearToClear}
              onChange={(e) => setYearToClear(Number(e.target.value))}
              className="px-2 py-1.5 bg-white border border-[#141414]/40 font-bold text-xs"
            >
              <option value={2025}>২০২৫</option>
              <option value={2026}>২০২৬</option>
              <option value={2027}>২০২৭</option>
            </select>
            <button
              onClick={handleClearMonth}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#801414] hover:bg-[#5C0E0E] text-white font-bold text-xs border border-[#801414] cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>হিসাব ০ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
