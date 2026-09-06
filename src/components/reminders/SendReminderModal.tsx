import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Smartphone,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TenantReminder } from '../../types';
import { formatCurrency, formatDateBn, toBengaliNumber } from '../../utils/formatters';
import { compileReminderMessage } from '../../utils/reminderHelper';

interface SendReminderModalProps {
  reminder: TenantReminder;
  isOpen: boolean;
  onClose: () => void;
  defaultChannel?: 'sms' | 'in_app' | 'whatsapp';
}

export const SendReminderModal: React.FC<SendReminderModalProps> = ({
  reminder,
  isOpen,
  onClose,
  defaultChannel = 'sms',
}) => {
  const { settings, reminderSettings, sendTenantReminder } = useApp();
  const [channel, setChannel] = useState<'sms' | 'in_app' | 'whatsapp'>(defaultChannel);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Initial message text compiled from template
  const initialTemplate =
    channel === 'in_app' ? reminderSettings.inAppTemplate : reminderSettings.smsTemplate;

  const [messageText, setMessageText] = useState(() =>
    compileReminderMessage(
      initialTemplate,
      {
        tenantName: reminder.tenantName,
        unitNumber: reminder.unitNumber,
        totalDue: reminder.totalDue,
        dueDate: reminder.dueDate,
        daysUntilDue: reminder.daysUntilDue,
        month: reminder.month,
        year: reminder.year,
      },
      settings
    )
  );

  if (!isOpen) return null;

  const handleChannelChange = (newChannel: 'sms' | 'in_app' | 'whatsapp') => {
    setChannel(newChannel);
    const tpl =
      newChannel === 'in_app' ? reminderSettings.inAppTemplate : reminderSettings.smsTemplate;
    setMessageText(
      compileReminderMessage(
        tpl,
        {
          tenantName: reminder.tenantName,
          unitNumber: reminder.unitNumber,
          totalDue: reminder.totalDue,
          dueDate: reminder.dueDate,
          daysUntilDue: reminder.daysUntilDue,
          month: reminder.month,
          year: reminder.year,
        },
        settings
      )
    );
  };

  const insertPlaceholder = (tag: string) => {
    setMessageText((prev) => prev + ' ' + tag);
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      await sendTenantReminder(reminder.tenantId, channel, messageText);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const charCount = messageText.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  const daysLabel =
    reminder.daysUntilDue === 0
      ? 'আজই শেষ দিন'
      : reminder.daysUntilDue > 0
      ? `${toBengaliNumber(reminder.daysUntilDue)} দিন বাকি`
      : `${toBengaliNumber(Math.abs(reminder.daysUntilDue))} দিন অতিবাহিত`;

  return (
    <div
      id="send-reminder-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="send-reminder-modal-container"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <MessageSquare className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">ভাড়া পরিশোধ রিমাইন্ডার পাঠান</h3>
              <p className="text-xs text-emerald-100/90 font-medium">
                {reminder.unitNumber} • {reminder.tenantName}
              </p>
            </div>
          </div>
          <button
            id="close-send-reminder-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Tenant Summary Info Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <div className="text-xs text-slate-500 font-medium">প্রদেয় ভাড়া ও বিল</div>
              <div className="text-lg font-bold text-slate-800">
                {formatCurrency(reminder.totalDue)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">পরিশোধের শেষ তারিখ</div>
              <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                {formatDateBn(reminder.dueDate)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">অবস্থা</div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  reminder.daysUntilDue === 0
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : reminder.daysUntilDue > 0
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {daysLabel}
              </span>
            </div>
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              বার্তা পাঠানোর মাধ্যম (Channel)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="channel-sms-btn"
                onClick={() => handleChannelChange('sms')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  channel === 'sms'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>মোবাইল SMS</span>
              </button>
              <button
                type="button"
                id="channel-whatsapp-btn"
                onClick={() => handleChannelChange('whatsapp')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  channel === 'whatsapp'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-green-600" />
                <span>হোয়াটসঅ্যাপ</span>
              </button>
              <button
                type="button"
                id="channel-inapp-btn"
                onClick={() => handleChannelChange('in_app')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  channel === 'in_app'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bell className="w-4 h-4 text-amber-600" />
                <span>ইন-অ্যাপ নোটিশ</span>
              </button>
            </div>
          </div>

          {/* Recipient Phone Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <span>প্রাপকের মোবাইল:</span>
            <span className="font-semibold text-slate-700 font-mono">
              {reminder.phone || 'নম্বর পাওয়া যায়নি'}
            </span>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                বার্তার বিবরণ (Message Content)
              </label>
              <span className="text-xs text-slate-500 font-mono">
                {toBengaliNumber(charCount)} অক্ষর ({toBengaliNumber(smsCount)} SMS)
              </span>
            </div>
            <textarea
              id="reminder-message-text"
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full text-sm p-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none font-sans leading-relaxed"
              placeholder="রিমাইন্ডার বার্তা লিখুন..."
            />
          </div>

          {/* Quick Variable Chips */}
          <div>
            <div className="text-xs text-slate-500 mb-1.5 font-medium">ভেরিয়েবল যোগ করুন:</div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { tag: '{TENANT_NAME}', label: 'ভাড়াটিয়ার নাম' },
                { tag: '{UNIT_NUMBER}', label: 'ফ্ল্যাট নং' },
                { tag: '{DUE_AMOUNT}', label: 'বকেয়া টাকা' },
                { tag: '{DUE_DATE}', label: 'শেষ তারিখ' },
                { tag: '{DAYS_LEFT}', label: 'বাকি দিন' },
              ].map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => insertPlaceholder(item.tag)}
                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors"
                >
                  +{item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status feedback */}
          {sentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>রিমাইন্ডার সফলভাবে প্রেরণ করা হয়েছে ও লগে যুক্ত হয়েছে!</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            id="cancel-send-reminder-btn"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            বাতিল
          </button>
          <button
            type="button"
            id="submit-send-reminder-btn"
            onClick={handleSend}
            disabled={isSending || !messageText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
          >
            {isSending ? (
              <span>পাঠানো হচ্ছে...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {channel === 'sms'
                    ? 'SMS পাঠান'
                    : channel === 'whatsapp'
                    ? 'WhatsApp পাঠান'
                    : 'ইন-অ্যাপ নোটিশ দিন'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
