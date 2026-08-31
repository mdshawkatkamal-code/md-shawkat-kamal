import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityLog } from '../../types';
import {
  Activity,
  Search,
  User,
  Shield,
  Clock,
  Filter,
  FileSpreadsheet,
  CreditCard,
  Home,
  Store,
  DollarSign,
  Settings,
} from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const { activityLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getActionIcon = (entity: string) => {
    switch (entity) {
      case 'bill':
        return <FileSpreadsheet className="w-4 h-4 text-indigo-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'flat':
        return <Home className="w-4 h-4 text-blue-600" />;
      case 'shop':
        return <Store className="w-4 h-4 text-teal-600" />;
      case 'expense':
        return <DollarSign className="w-4 h-4 text-rose-600" />;
      case 'settings':
        return <Settings className="w-4 h-4 text-amber-600" />;
      default:
        return <Activity className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#141414]" />
            <span>অ্যাক্টিভিটি লগ ও অডিট ট্রেইল (Activity Audit Log)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            ম্যানেজার ও ব্যবহারকারীদের সকল কার্যক্রম, বিল তৈরি, পেমেন্ট আদায় ও ডেটা পরিবর্তনের রিয়েল-টাইম লগ
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex flex-col sm:flex-row gap-2.5 items-center justify-between font-mono-data">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ব্যবহারকারী, অ্যাকশন বা বিবরণ দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1 text-xs bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="ব্যবহারকারীর ভূমিকা ফিল্টার"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-[#141414]/30 bg-[#EBEAE6] font-bold outline-none cursor-pointer"
          >
            <option value="all">সকল ইউজার রোল</option>
            <option value="owner">মালিক (Owner)</option>
            <option value="manager">ম্যানেজার (Manager)</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-[#F4F3F0] border border-[#141414] overflow-hidden font-mono-data">
        <div className="divide-y divide-[#141414]/15">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-[#141414]/50 text-xs">
              কোন অ্যাক্টিভিটি লগ পাওয়া যায়নি।
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isOwnerRole = log.userRole === 'owner';

              return (
                <div
                  key={log.id}
                  className="p-3.5 hover:bg-[#EBEAE6] transition-colors flex items-start gap-3 text-xs"
                >
                  <div className="p-1.5 bg-[#DDDCD7] border border-[#141414]/30 shrink-0 mt-0.5">
                    {getActionIcon(log.entity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#141414]">{log.userName}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 border ${
                            isOwnerRole
                              ? 'bg-[#141414] text-white border-[#141414]'
                              : 'bg-[#DDDCD7] text-[#141414] border-[#141414]/30'
                          }`}
                        >
                          {isOwnerRole ? 'Owner' : 'Manager'}
                        </span>
                        <span className="text-[#141414]/30">•</span>
                        <span className="font-bold text-[#141414]">{log.action}</span>
                      </div>

                      <div className="text-[11px] text-[#141414]/60 font-mono shrink-0">
                        {log.timestamp}
                      </div>
                    </div>

                    <p className="text-[#141414]/80 mt-1">{log.details}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
