import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Share2 } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'banner' | 'sidebar' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Suppress button if already installed as standalone PWA
  if (isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // 1. Navbar style button
  if (variant === 'navbar') {
    if (isInstallable) {
      return (
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono-data font-bold text-[#144A29] bg-[#D2E3D8] hover:bg-[#C2D8CA] border border-[#144A29]/40 transition-colors cursor-pointer"
          title="মোবাইলে বা কম্পিউটারে অ্যাপ ইনস্টল করুন"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">অ্যাপ ইনস্টল</span>
          <span className="sm:hidden">ইনস্টল</span>
        </button>
      );
    }

    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono-data font-bold text-[#141414] bg-[#DDDCD7] hover:bg-[#D0CFCA] border border-[#141414]/30 transition-colors cursor-pointer"
            title="iPhone / iPad-এ ইনস্টল করার নিয়ম"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iOS অ্যাপ</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="w-full max-w-sm bg-[#F4F3F0] border-2 border-[#141414] p-5 shadow-2xl space-y-4 font-mono-data">
                <div className="flex items-center justify-between border-b border-[#141414]/20 pb-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[#141414]" />
                    <h3 className="text-sm font-bold text-[#141414]">iPhone / iPad-এ ইনস্টল করুন</h3>
                  </div>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="p-1 hover:bg-[#DDDCD7] border border-transparent hover:border-[#141414]/20"
                  >
                    <X className="w-4 h-4 text-[#141414]" />
                  </button>
                </div>

                <div className="space-y-3 text-xs text-[#141414]/80 font-sans">
                  <div className="flex items-start gap-2.5 bg-[#EBEAE6] p-2.5 border border-[#141414]/20">
                    <div className="w-5 h-5 bg-[#141414] text-[#E4E3E0] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ১
                    </div>
                    <div>
                      Safari ব্রাউজারের নিচে <strong>Share (<Share2 className="w-3 h-3 inline-block" />)</strong> বাটনে ট্যাপ করুন।
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#EBEAE6] p-2.5 border border-[#141414]/20">
                    <div className="w-5 h-5 bg-[#141414] text-[#E4E3E0] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ২
                    </div>
                    <div>
                      নিচের দিকে স্ক্রোল করে <strong>"Add to Home Screen" (হোম স্ক্রিনে যোগ)</strong> নির্বাচন করুন।
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#EBEAE6] p-2.5 border border-[#141414]/20">
                    <div className="w-5 h-5 bg-[#141414] text-[#E4E3E0] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ৩
                    </div>
                    <div>
                      উপরে ডানে <strong>"Add"</strong> বাটনে চাপ দিন। আপনার ফোনে হোম স্ক্রিন আইকন তৈরি হয়ে যাবে!
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2 bg-[#141414] text-[#E4E3E0] text-xs font-bold hover:bg-[#333333] border border-[#141414] transition-colors"
                >
                  বুঝেছি (Close)
                </button>
              </div>
            </div>
          )}
        </>
      );
    }
  }

  // 2. Mobile / Sidebar install prompt card
  if (variant === 'sidebar' || variant === 'banner') {
    return (
      <div className="bg-[#EBEAE6] border border-[#141414]/30 p-2.5 rounded-none font-mono-data space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#141414] text-[#E4E3E0] flex items-center justify-center border border-[#141414]">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-[#141414] leading-tight">মোবাইল অ্যাপ সংস্করণ</h4>
            <p className="text-[10px] text-[#141414]/70 font-sans">হোম স্ক্রিন থেকে সরাসরি ব্যবহার করুন</p>
          </div>
        </div>

        {isInstallable && (
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-[#E4E3E0] bg-[#144A29] hover:bg-[#0E351D] border border-[#144A29] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>অ্যাপ ইনস্টল করুন</span>
          </button>
        )}

        {isIOS && (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-[#141414] bg-[#DDDCD7] hover:bg-[#D0CFCA] border border-[#141414]/30 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>iPhone-এ ইনস্টল নির্দেশিকা</span>
          </button>
        )}

        {!isInstallable && !isIOS && (
          <div className="text-[10px] text-[#141414]/70 bg-[#DDDCD7] p-1.5 border border-[#141414]/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#144A29] shrink-0" />
            <span>ব্রাউজার মেনু থেকে "Add to Home Screen" করুন</span>
          </div>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm bg-[#F4F3F0] border-2 border-[#141414] p-5 shadow-2xl space-y-4 font-mono-data">
              <div className="flex items-center justify-between border-b border-[#141414]/20 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#141414]" />
                  <h3 className="text-sm font-bold text-[#141414]">iPhone / iPad-এ ইনস্টল করুন</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 hover:bg-[#DDDCD7] border border-transparent hover:border-[#141414]/20"
                >
                  <X className="w-4 h-4 text-[#141414]" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#141414]/80 font-sans">
                <div className="flex items-start gap-2.5 bg-[#EBEAE6] p-2.5 border border-[#141414]/20">
                  <div className="w-5 h-5 bg-[#141414] text-[#E4E3E0] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ১
                  </div>
                  <div>
                    Safari ব্রাউজারের নিচে <strong>Share (<Share2 className="w-3 h-3 inline-block" />)</strong> বাটনে ট্যাপ করুন।
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[#EBEAE6] p-2.5 border border-[#141414]/20">
                  <div className="w-5 h-5 bg-[#141414] text-[#E4E3E0] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ২
                  </div>
                  <div>
                    নিচের দিকে স্ক্রোল করে <strong>"Add to Home Screen" (হোম স্ক্রিনে যোগ)</strong> নির্বাচন করুন।
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[#EBEAE6] p-2.5 border border-[#141414]/20">
                  <div className="w-5 h-5 bg-[#141414] text-[#E4E3E0] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ৩
                  </div>
                  <div>
                    উপরে ডানে <strong>"Add"</strong> বাটনে চাপ দিন। আপনার ফোনে হোম স্ক্রিন আইকন তৈরি হয়ে যাবে!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-[#141414] text-[#E4E3E0] text-xs font-bold hover:bg-[#333333] border border-[#141414] transition-colors"
              >
                বুঝেছি (Close)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
