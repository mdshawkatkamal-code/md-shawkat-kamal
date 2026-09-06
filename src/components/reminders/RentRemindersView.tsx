import React, { useState, useMemo } from 'react';
import {
  Bell,
  Smartphone,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send,
  Settings,
  History,
  Users,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sliders,
  Trash2,
  Info,
  Check,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TenantReminder, ReminderSettings } from '../../types';
import { formatCurrency, formatDateBn, toBengaliNumber, MONTHS, MONTHS_BN } from '../../utils/formatters';
import { compileReminderMessage } from '../../utils/reminderHelper';
import { SendReminderModal } from './SendReminderModal';

export const RentRemindersView: React.FC = () => {
  const {
    tenants,
    bills,
    settings,
    reminderSettings,
    updateReminderSettings,
    reminderLogs,
    approachingReminders,
    sendTenantReminder,
    sendBatchReminders,
    runAutomaticRemindersCheck,
    deleteReminderLog,
    clearAllReminderLogs,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    setActiveTab,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'setup' | 'logs'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due_today' | 'approaching' | 'overdue'>('all');

  // Modal state for single tenant reminder
  const [selectedReminderForModal, setSelectedReminderForModal] = useState<TenantReminder | null>(null);
  const [modalDefaultChannel, setModalDefaultChannel] = useState<'sms' | 'in_app' | 'whatsapp'>('sms');

  // Batch action state
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<ReminderSettings>(() => ({
    ...reminderSettings,
  }));
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Filter approaching reminders
  const filteredReminders = useMemo(() => {
    return approachingReminders.filter((rem) => {
      // Search
      const matchSearch =
        rem.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rem.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rem.phone.includes(searchQuery);

      // Status
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'due_today'
          ? rem.daysUntilDue === 0
          : statusFilter === 'approaching'
          ? rem.daysUntilDue > 0
          : rem.daysUntilDue < 0;

      return matchSearch && matchStatus;
    });
  }, [approachingReminders, searchQuery, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = approachingReminders.length;
    const totalAmount = approachingReminders.reduce((acc, curr) => acc + curr.totalDue, 0);
    const dueTodayCount = approachingReminders.filter((r) => r.daysUntilDue === 0).length;
    const approachingSoonCount = approachingReminders.filter((r) => r.daysUntilDue > 0 && r.daysUntilDue <= 5).length;
    const overdueCount = approachingReminders.filter((r) => r.daysUntilDue < 0).length;

    return { totalCount, totalAmount, dueTodayCount, approachingSoonCount, overdueCount };
  }, [approachingReminders]);

  // Batch send to all approaching tenants
  const handleBatchSendSMS = async () => {
    if (approachingReminders.length === 0) return;
    const confirmSend = window.confirm(
      `আপনি কি সকল আসন্ন ${toBengaliNumber(approachingReminders.length)} জন ভাড়াটিয়াকে এক ক্লিকে স্বয়ংক্রিয় SMS পাঠাতে চান?`
    );
    if (!confirmSend) return;

    setIsBatchSending(true);
    try {
      const res = await sendBatchReminders('sms');
      setBatchSuccessMsg(
        `সফলভাবে ${toBengaliNumber(res.successCount)} জন ভাড়াটিয়াকে রিমাইন্ডার SMS প্রেরণ করা হয়েছে!`
      );
      setTimeout(() => setBatchSuccessMsg(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBatchSending(false);
    }
  };

  // Trigger auto check now
  const handleRunAutoCheckNow = () => {
    const result = runAutomaticRemindersCheck(true);
    setBatchSuccessMsg(result.message);
    setTimeout(() => setBatchSuccessMsg(null), 4000);
  };

  // Save settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateReminderSettings(settingsForm);
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 3000);
  };

  // Toggle days before due date in settings form
  const handleToggleDay = (day: number) => {
    setSettingsForm((prev) => {
      const exists = prev.daysBeforeDueDate.includes(day);
      const updated = exists
        ? prev.daysBeforeDueDate.filter((d) => d !== day)
        : [...prev.daysBeforeDueDate, day].sort((a, b) => b - a);
      return { ...prev, daysBeforeDueDate: updated };
    });
  };

  // Sample compiled message for live phone preview in setup tab
  const sampleReminder: TenantReminder = approachingReminders[0] || {
    id: 'sample-1',
    tenantId: 't1',
    tenantName: 'তানভীর আহমেদ',
    phone: '01711234567',
    email: 'tanvir@gmail.com',
    unitNumber: 'Flat 302',
    unitType: 'flat',
    monthlyRent: 26500,
    totalDue: 26500,
    dueDate: `${selectedYear}-09-${String(settings.defaultRentDueDate || 10).padStart(2, '0')}`,
    daysUntilDue: 3,
    status: 'approaching',
    month: selectedMonth,
    year: selectedYear,
  };

  const previewCompiledMessage = compileReminderMessage(
    settingsForm.smsTemplate,
    sampleReminder,
    settings
  );

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                ভাড়া পরিশোধ রিমাইন্ডার ও নোটিফিকেশন
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                আসন্ন ভাড়ার সময়সূচি অনুযায়ী স্বয়ংক্রিয় SMS, হোয়াটসঅ্যাপ ও ইন-অ্যাপ নোটিশ ব্যবস্থাপনা
              </p>
            </div>
          </div>
        </div>

        {/* Engine Status & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              reminderSettings.enabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                reminderSettings.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>স্বয়ংক্রিয় ইঞ্জিন: {reminderSettings.enabled ? 'সক্রিয়' : 'বন্ধ'}</span>
          </div>

          <button
            type="button"
            id="run-auto-check-btn"
            onClick={handleRunAutoCheckNow}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>অটো-চেক রান করুন</span>
          </button>

          <button
            type="button"
            id="batch-send-sms-btn"
            onClick={handleBatchSendSMS}
            disabled={isBatchSending || approachingReminders.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isBatchSending
                ? 'পাঠানো হচ্ছে...'
                : `সবাইকে SMS পাঠান (${toBengaliNumber(approachingReminders.length)})`}
            </span>
          </button>
        </div>
      </div>

      {/* Success alert message if any */}
      {batchSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-800 text-sm font-medium animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{batchSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setBatchSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-xs gap-1">
        <button
          type="button"
          id="tab-approaching-list"
          onClick={() => setActiveSubTab('list')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeSubTab === 'list'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>আসন্ন ভাড়া পরিশোধ তালিকা</span>
          {approachingReminders.length > 0 && (
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeSubTab === 'list'
                  ? 'bg-emerald-800 text-emerald-100'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {toBengaliNumber(approachingReminders.length)}
            </span>
          )}
        </button>

        <button
          type="button"
          id="tab-setup"
          onClick={() => setActiveSubTab('setup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeSubTab === 'setup'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>স্বয়ংক্রিয় রিমাইন্ডার সেটআপ ও টেমপ্লেট</span>
        </button>

        <button
          type="button"
          id="tab-logs"
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeSubTab === 'logs'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>রিমাইন্ডার হিস্ট্রি ও লগ ({toBengaliNumber(reminderLogs.length)})</span>
        </button>
      </div>

      {/* SUB-TAB 1: APPROCHING REMINDERS LIST */}
      {activeSubTab === 'list' && (
        <div className="space-y-6">
          {/* Metrics summary banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">মোট আসন্ন রিমাইন্ডার</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-800">
                {toBengaliNumber(metrics.totalCount)} <span className="text-sm font-normal text-slate-500">জন</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                মোট প্রদেয়: <span className="font-bold text-slate-700">{formatCurrency(metrics.totalAmount)}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700">আজই শেষ দিন (Due Today)</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-amber-800">
                {toBengaliNumber(metrics.dueTodayCount)} <span className="text-sm font-normal text-amber-600">জন</span>
              </div>
              <div className="text-xs text-amber-600 mt-1 font-medium">আজকের মধ্যেই ভাড়া পরিশোধ কাম্য</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-teal-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-700">আগামী ১-৫ দিনে বকেয়া</span>
                <Calendar className="w-4 h-4 text-teal-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-teal-800">
                {toBengaliNumber(metrics.approachingSoonCount)}{' '}
                <span className="text-sm font-normal text-teal-600">জন</span>
              </div>
              <div className="text-xs text-teal-600 mt-1 font-medium">তারিখ ঘনিয়ে আসছে</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700">সময় পার হয়েছে (Overdue)</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="mt-2 text-2xl font-black text-rose-800">
                {toBengaliNumber(metrics.overdueCount)} <span className="text-sm font-normal text-rose-600">জন</span>
              </div>
              <div className="text-xs text-rose-600 mt-1 font-medium">বকেয়া সতর্কবার্তা প্রয়োজন</div>
            </div>
          </div>

          {/* Search, Filter and Month controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative min-w-[260px] flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-approaching-tenants"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ভাড়াটিয়ার নাম, ফ্ল্যাট/দোকান নং বা ফোন নম্বর খুঁজুন..."
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'সবগুলো' },
                { id: 'due_today', label: 'আজ শেষ দিন' },
                { id: 'approaching', label: 'আসন্ন (১-৫ দিন)' },
                { id: 'overdue', label: 'বিলম্বিত/বকেয়া' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === pill.id
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Month & Year Select */}
            <div className="flex items-center gap-2">
              <select
                id="reminder-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {MONTHS_BN[m]}
                  </option>
                ))}
              </select>
              <select
                id="reminder-year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {toBengaliNumber(y)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Approaching List Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {filteredReminders.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">কোন আসন্ন ভাড়া রিমাইন্ডার পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  নির্বাচিত মাসে সকল ভাড়াটিয়া হয়তো পরিশোধ সম্পন্ন করেছেন অথবা কোন শর্তের সাথে মিলছে না।
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">ইউনিট / ফ্ল্যাট</th>
                      <th className="py-3.5 px-4">ভাড়াটিয়ার নাম ও মোবাইল</th>
                      <th className="py-3.5 px-4">পরিশোধের শেষ তারিখ</th>
                      <th className="py-3.5 px-4">বাকি সময় / অবস্থা</th>
                      <th className="py-3.5 px-4">প্রদেয় টাকা</th>
                      <th className="py-3.5 px-4">সর্বশেষ নোটিশ</th>
                      <th className="py-3.5 px-4 text-right">রিমাইন্ডার অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredReminders.map((rem) => {
                      const isDueToday = rem.daysUntilDue === 0;
                      const isOverdue = rem.daysUntilDue < 0;

                      return (
                        <tr
                          key={rem.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Unit No */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{rem.unitNumber}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                                  rem.unitType === 'flat'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}
                              >
                                {rem.unitType === 'flat' ? 'ফ্ল্যাট' : 'দোকান'}
                              </span>
                            </div>
                          </td>

                          {/* Tenant Name & Contact */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{rem.tenantName}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                              {rem.phone || 'নম্বর নেই'}
                            </div>
                          </td>

                          {/* Due Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-slate-700 font-medium flex items-center gap-1.5 text-xs">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {formatDateBn(rem.dueDate)}
                            </div>
                          </td>

                          {/* Countdown badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isDueToday ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                <Clock className="w-3 h-3 text-amber-700" />
                                আজই শেষ দিন!
                              </span>
                            ) : isOverdue ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                {toBengaliNumber(Math.abs(rem.daysUntilDue))} দিন অতিবাহিত
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Clock className="w-3 h-3 text-emerald-600" />
                                {toBengaliNumber(rem.daysUntilDue)} দিন বাকি
                              </span>
                            )}
                          </td>

                          {/* Total Due */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 text-base">
                              {formatCurrency(rem.totalDue)}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              মাসিক ভাড়া: {formatCurrency(rem.monthlyRent)}
                            </div>
                          </td>

                          {/* Last sent notification */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                            {rem.lastNotifiedAt ? (
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-700 capitalize flex items-center gap-1">
                                  {rem.lastNotifiedChannel === 'sms' ? (
                                    <Smartphone className="w-3 h-3 text-emerald-600" />
                                  ) : rem.lastNotifiedChannel === 'whatsapp' ? (
                                    <MessageSquare className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Bell className="w-3 h-3 text-amber-600" />
                                  )}
                                  {rem.lastNotifiedChannel === 'sms'
                                    ? 'এসএমএস প্রেরিত'
                                    : rem.lastNotifiedChannel === 'whatsapp'
                                    ? 'হোয়াটসঅ্যাপ'
                                    : 'ইন-অ্যাপ নোটিশ'}
                                </span>
                                <span className="text-[10px] text-slate-400">{rem.lastNotifiedAt}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">এখনো পাঠানো হয়নি</span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* SMS Send button */}
                              <button
                                type="button"
                                id={`send-sms-${rem.tenantId}`}
                                onClick={() => {
                                  setSelectedReminderForModal(rem);
                                  setModalDefaultChannel('sms');
                                }}
                                title="মোবাইল SMS পাঠান"
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
                              >
                                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                                <span>SMS</span>
                              </button>

                              {/* WhatsApp button */}
                              <button
                                type="button"
                                id={`send-wa-${rem.tenantId}`}
                                onClick={() => {
                                  setSelectedReminderForModal(rem);
                                  setModalDefaultChannel('whatsapp');
                                }}
                                title="হোয়াটসঅ্যাপে বার্তা পাঠান"
                                className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-colors"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>

                              {/* In-app notice button */}
                              <button
                                type="button"
                                id={`send-inapp-${rem.tenantId}`}
                                onClick={async () => {
                                  await sendTenantReminder(rem.tenantId, 'in_app');
                                  alert(`ইন-অ্যাপ রিমাইন্ডার সফলভাবে যুক্ত করা হয়েছে!`);
                                }}
                                title="ইন-অ্যাপ নোটিশ দিন"
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
                              >
                                <Bell className="w-4 h-4" />
                              </button>

                              {/* Billing jump */}
                              <button
                                type="button"
                                id={`view-billing-${rem.tenantId}`}
                                onClick={() => setActiveTab('billing')}
                                title="বিলিং ও পেমেন্টে যান"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUTOMATIC SETUP & TEMPLATES */}
      {activeSubTab === 'setup' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {settingsSavedMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-sm font-semibold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>স্বয়ংক্রিয় রিমাইন্ডার ও এসএমএস সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Rules & Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: Main Toggle */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      স্বয়ংক্রিয় রিমাইন্ডার ইঞ্জিন সক্রিয়করণ
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      সিস্টেম প্রতিদিন স্বয়ংক্রিয়ভাবে আসন্ন ভাড়ার তালিকা যাচাই করে নোটিফিকেশন পাঠাবে
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="auto-reminders-toggle"
                      checked={settingsForm.enabled}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, enabled: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Card 2: Schedule Days */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    কখন রিমাইন্ডার পাঠানো হবে? (সময়সূচি শিডিউল)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    পরিশোধের শেষ তারিখ (ডিউ ডেট)-এর কত দিন পূর্বে স্বয়ংক্রিয় বার্তা ট্রিগার হবে
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { day: 7, label: '৭ দিন পূর্বে' },
                    { day: 5, label: '৫ দিন পূর্বে' },
                    { day: 3, label: '৩ দিন পূর্বে' },
                    { day: 2, label: '২ দিন পূর্বে' },
                    { day: 1, label: '১ দিন পূর্বে' },
                    { day: 0, label: 'পরিশোধের শেষ দিনে' },
                  ].map((item) => {
                    const isChecked = settingsForm.daysBeforeDueDate.includes(item.day);
                    return (
                      <button
                        key={item.day}
                        type="button"
                        onClick={() => handleToggleDay(item.day)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-semibold transition-all ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{item.label}</span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                            isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: Notification Channels */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    বার্তা প্রেরণের চ্যানেল নির্বাচন
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    কোন কোন মাধ্যমে নোটিফিকেশন ও মেসেজ পৌঁছে দেওয়া হবে
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={settingsForm.notifyInApp}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, notifyInApp: e.target.checked }))
                      }
                      className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-amber-600" />
                        ইন-অ্যাপ নোটিফিকেশন (সিস্টেম বেল ও ড্যাশবোর্ড অ্যালার্ট)
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        সফটওয়্যারের উপরে নোটিফিকেশন বেল ও ড্যাশবোর্ডে আসন্ন ভাড়ার তালিকা প্রদর্শিত হবে।
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={settingsForm.notifySMS}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, notifySMS: e.target.checked }))
                      }
                      className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        মোবাইল SMS রিমাইন্ডার
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        ভাড়াটিয়ার মোবাইল নম্বরে সরাসরি বাংলা এসএমএস বার্তা পাঠানোর সুবিধা।
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={settingsForm.notifyWhatsApp}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, notifyWhatsApp: e.target.checked }))
                      }
                      className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        হোয়াটসঅ্যাপ (WhatsApp) শর্টকাট
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        এক ক্লিকে প্রি-ফিল্ড বাংলা মেসেজসহ হোয়াটসঅ্যাপ চ্যাট খোলার সুবিধা।
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={settingsForm.autoSendSMSOnDueDate}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          autoSendSMSOnDueDate: e.target.checked,
                        }))
                      }
                      className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        শেষ দিনে স্বয়ংক্রিয়ভাবে সরাসরি SMS প্রেরণ
                      </div>
                      <div className="text-xs text-emerald-700/80 mt-0.5">
                        ডিউ ডেটে কোনো ম্যানুয়াল ক্লিক ছাড়া ব্যাকগ্রাউন্ডে স্বয়ংক্রিয় এসএমএস ডেলিভারি করবে।
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Card 4: Customizable Templates */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    এসএমএস (SMS) বার্তা টেমপ্লেট
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    টেমপ্লেটে ডায়নামিক ভ্যারিয়েবল বসিয়ে আপনার পছন্দমতো কাস্টমাইজ করুন
                  </p>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={settingsForm.smsTemplate}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, smsTemplate: e.target.value }))
                    }
                    className="w-full text-sm p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
                  />
                  <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                    <span>
                      দৈর্ঘ্য: {toBengaliNumber(settingsForm.smsTemplate.length)} অক্ষর (
                      {toBengaliNumber(Math.ceil(settingsForm.smsTemplate.length / 160))}টি SMS)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          smsTemplate:
                            'আসসালামু আলাইকুম {TENANT_NAME} সাহেব, তুলতুল ভিলা ({UNIT_NUMBER})-এর {MONTH} মাসের ভাড়া ও ইউটিলিটি বিল মোট ৳{DUE_AMOUNT} পরিশোধের শেষ তারিখ {DUE_DATE} ({DAYS_LEFT})। নির্ধারিত সময়ের মধ্যে পরিশোধের অনুরোধ রইলো। - {PROPERTY_NAME}, যোগাযোগ: {PAYMENT_PHONE}',
                        }))
                      }
                      className="text-emerald-700 hover:underline font-semibold"
                    >
                      ডিফল্ট টেমপ্লেটে রিসেট করুন
                    </button>
                  </div>
                </div>

                {/* Variable Tags */}
                <div>
                  <div className="text-xs text-slate-500 mb-1.5 font-medium">ক্লিক করে ট্যাগ যোগ করুন:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { tag: '{TENANT_NAME}', label: 'ভাড়াটিয়ার নাম' },
                      { tag: '{UNIT_NUMBER}', label: 'ফ্ল্যাট/দোকান নং' },
                      { tag: '{MONTH}', label: 'মাসের নাম' },
                      { tag: '{DUE_AMOUNT}', label: 'বকেয়া টাকা' },
                      { tag: '{DUE_DATE}', label: 'শেষ তারিখ' },
                      { tag: '{DAYS_LEFT}', label: 'বাকি দিন' },
                      { tag: '{PROPERTY_NAME}', label: 'ভবনের নাম' },
                      { tag: '{PAYMENT_PHONE}', label: 'যোগাযোগ নম্বর' },
                    ].map((chip) => (
                      <button
                        key={chip.tag}
                        type="button"
                        onClick={() =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            smsTemplate: prev.smsTemplate + ' ' + chip.tag,
                          }))
                        }
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
                      >
                        +{chip.label} ({chip.tag})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 5: In-App Notice Template */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    ইন-অ্যাপ নোটিফিকেশন বার্তা টেমপ্লেট
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ড্যাশবোর্ড ও বেল নোটিফিকেশনে যা প্রদর্শিত হবে
                  </p>
                </div>
                <textarea
                  rows={2}
                  value={settingsForm.inAppTemplate}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({ ...prev, inAppTemplate: e.target.value }))
                  }
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed"
                />
              </div>
            </div>

            {/* Right Column: Live Mockup Preview & Gateway */}
            <div className="space-y-6">
              {/* Phone Mockup Card */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-800 p-5 rounded-3xl text-white shadow-xl border border-slate-700">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>লাইভ SMS প্রিভিউ</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-400 font-bold">Banglalink / Grameenphone</span>
                </div>

                {/* Simulated SMS Bubble */}
                <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 shadow-inner space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">
                      {settings.propertyNameBn || 'TulTul Villa'}
                    </span>
                    <span>সকাল ১০:০০</span>
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                    {previewCompiledMessage}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>প্রাপক: {sampleReminder.tenantName} ({sampleReminder.unitNumber})</span>
                  <span className="text-emerald-400 font-semibold">সিমুলেশন সক্রিয়</span>
                </div>
              </div>

              {/* Gateway Provider Settings */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    SMS গেটওয়ে প্রোভাইডার
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    মোবাইল SMS পাঠানোর মাধ্যম কনফিগারেশন
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      গেটওয়ে মোড
                    </label>
                    <select
                      value={settingsForm.smsGatewayProvider}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          smsGatewayProvider: e.target.value as any,
                        }))
                      }
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="simulation">সরাসরি ডিভাইস ও সিমুলেশন মোড (প্রস্তাবিত)</option>
                      <option value="ssl_wireless">SSL Wireless BD SMS Gateway</option>
                      <option value="greenweb">Greenweb BD Bulk SMS</option>
                      <option value="device_sms">ডিভাইস নেটিভ মেসেজিং (sms: protocol)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      প্রেরক মোবাইল / হেল্পলাইন নম্বর
                    </label>
                    <input
                      type="text"
                      value={settingsForm.senderPhone || ''}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, senderPhone: e.target.value }))
                      }
                      placeholder="যেমন: +880 1711-234567"
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="sticky bottom-6">
                <button
                  type="submit"
                  id="save-reminder-settings-btn"
                  className="w-full py-3 px-6 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>সেটিংস ও টেমপ্লেট সংরক্ষণ করুন</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SUB-TAB 3: REMINDER LOGS & HISTORY */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                প্রেরিত রিমাইন্ডার অডিট লগ ও ডেলিভারি হিস্ট্রি
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                সকল সফলভাবে প্রেরিত এসএমএস, নোটিফিকেশন ও বার্তা ট্র্যাকিং
              </p>
            </div>
            {reminderLogs.length > 0 && (
              <button
                type="button"
                id="clear-all-reminder-logs-btn"
                onClick={() => {
                  if (window.confirm('আপনি কি সকল রিমাইন্ডার লগ মুছে ফেলতে চান?')) {
                    clearAllReminderLogs();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>সকল লগ মুছুন</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {reminderLogs.length === 0 ? (
              <div className="text-center py-16 px-4">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">এখনো কোনো রিমাইন্ডার পাঠানো হয়নি</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  ভাড়াটিয়াদের SMS বা নোটিশ পাঠালে তার পূর্ণাঙ্গ বিবরণ এখানে সংরক্ষিত থাকবে।
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">তারিখ ও সময়</th>
                      <th className="py-3 px-4">ভাড়াটিয়া ও ফ্ল্যাট</th>
                      <th className="py-3 px-4">চ্যানেল</th>
                      <th className="py-3 px-4">মোবাইল</th>
                      <th className="py-3 px-4">প্রদেয় টাকা</th>
                      <th className="py-3 px-4">বার্তার সারসংক্ষেপ</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">মুছে ফেলুন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {reminderLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                          {log.sentAt}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-800">{log.tenantName}</span>
                          <span className="ml-1 text-slate-500">({log.unitNumber})</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              log.channel === 'sms'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.channel === 'whatsapp'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {log.channel === 'sms' ? (
                              <Smartphone className="w-3 h-3" />
                            ) : log.channel === 'whatsapp' ? (
                              <MessageSquare className="w-3 h-3" />
                            ) : (
                              <Bell className="w-3 h-3" />
                            )}
                            {log.channel.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                          {log.phone}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-800">
                          {formatCurrency(log.dueAmount)}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={log.message}>
                          {log.message}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ডেলিভার্ড
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => deleteReminderLog(log.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="লগ মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Single Reminder Send Modal */}
      {selectedReminderForModal && (
        <SendReminderModal
          reminder={selectedReminderForModal}
          isOpen={true}
          onClose={() => setSelectedReminderForModal(null)}
          defaultChannel={modalDefaultChannel}
        />
      )}
    </div>
  );
};
