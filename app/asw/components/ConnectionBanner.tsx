'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function ConnectionBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnect, setShowReconnect] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnect(true);
      setTimeout(() => setShowReconnect(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnect(false);
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnect) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] text-center py-1.5 text-xs font-medium transition-all ${
        isOnline
          ? 'bg-green-500/90 text-white'
          : 'bg-red-500/90 text-white'
      }`}
    >
      <div className="flex items-center justify-center gap-1.5">
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>You are offline — clip markers will be saved locally</span>
          </>
        )}
      </div>
    </div>
  );
}
