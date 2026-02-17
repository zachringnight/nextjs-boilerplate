'use client';

import { useState, useEffect, useRef } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function ConnectionBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const goOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
    };
    const goOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setLastOnline(new Date());
    };

    if (!navigator.onLine) {
      goOffline();
    }

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!showBanner) return null;

  const formatLastOnline = () => {
    if (!lastOnline) return '';
    return lastOnline.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="px-4 py-2 bg-[#F59E0B]/10 border-b border-[#F59E0B]/30 flex items-center justify-between">
      <div className="flex items-center gap-2 text-[#F59E0B] text-sm">
        <WifiOff className="w-4 h-4 flex-shrink-0" />
        <span>
          {isOnline ? 'Reconnected' : 'Offline — data may be delayed'}
          {lastOnline && !isOnline && (
            <span className="text-[#F59E0B]/70 ml-1">
              (since {formatLastOnline()})
            </span>
          )}
        </span>
      </div>
      {!isOnline && (
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#F59E0B] hover:bg-[#F59E0B]/20 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
      {isOnline && (
        <button
          onClick={() => setShowBanner(false)}
          className="text-[#F59E0B]/70 text-xs hover:text-[#F59E0B]"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
