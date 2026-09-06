import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, Zap } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center justify-between gap-3 bg-[#141414] text-[#E4E3E0] px-4 py-2.5 border-2 border-[#805000] shadow-2xl font-mono-data text-xs animate-bounce">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-[#EBDCB2] shrink-0" />
        <div>
          <strong className="text-[#EBDCB2] block">অফলাইন মোড (Offline Mode)</strong>
          <span className="text-[11px] text-[#E4E3E0]/80 font-sans">
            ক্যাশড ডেটা সক্রিয় আছে। ইন্টারনেট সংযোগ আসলে তথ্য আপডেট হবে।
          </span>
        </div>
      </div>
      <span className="h-2 w-2 rounded-full bg-[#EBDCB2] animate-ping shrink-0" />
    </div>
  );
};
