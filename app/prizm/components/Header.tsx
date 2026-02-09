'use client';

import Link from 'next/link';
import { Search, Type, Timer, Bell, BellOff } from 'lucide-react';
import { useAppStore } from '../store';
import { formatTime12, getCurrentDayNumber, getEventStatus, formatDateShort } from '../lib/time';
import { useEffect, useState } from 'react';
import { useMounted } from '../hooks/useMounted';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showTimer?: boolean;
  showNotifications?: boolean;
}

export default function Header({
  title = 'Prizm Lounge',
  showSearch = true,
  showTimer = true,
  showNotifications = true,
}: HeaderProps) {
  const {
    largeText,
    toggleLargeText,
    setSearchOpen,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useAppStore();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const mounted = useMounted();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(formatTime12(now));
      setCurrentDate(formatDateShort(now));

      const dayNum = getCurrentDayNumber();
      const status = getEventStatus();
      switch (status) {
        case 'pre-show': setStatusMessage('Pre-Show'); break;
        case 'lunch': setStatusMessage('Lunch Break'); break;
        case 'wrapped': setStatusMessage("That's a Wrap!"); break;
        case 'off-day': setStatusMessage('Event Preview'); break;
        default: setStatusMessage(`Day ${dayNum} of 3`); break;
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const status = getEventStatus();

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      // Request permission when enabling
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
        }
      } else if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass">
      {/* Premium gold accent line */}
      <div className="h-[2px] gold-gradient" />
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-col">
          <h1 className={`font-bold text-white tracking-tight ${largeText ? 'text-2xl' : 'text-xl'}`}>
            {title}
          </h1>
          <div className={`flex items-center gap-2 text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
            {mounted && (
              <>
                <span>{currentDate}</span>
                <span className="text-[#4B5563]">&middot;</span>
                <span className="font-mono tabular-nums">{currentTime}</span>
                <span className="text-[#4B5563]">&middot;</span>
                <span className={`font-medium ${status === 'active' ? 'text-[#22c55e]' : 'text-[#9CA3AF]'}`}>
                  {status === 'active' && <span className="inline-block w-1.5 h-1.5 bg-[#22c55e] rounded-full mr-1.5 pulse-ring" />}
                  {statusMessage}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {showSearch && (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors touch-target"
              aria-label="Search (Cmd+K)"
            >
              <Search size={20} className="text-[#9CA3AF]" />
            </button>
          )}

          {showTimer && (
            <Link
              href="/prizm/timer"
              className="p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors touch-target"
              aria-label="Timer"
            >
              <Timer size={20} className="text-[#9CA3AF]" />
            </Link>
          )}

          {showNotifications && (
            <button
              onClick={handleNotificationToggle}
              className={`p-2.5 rounded-xl transition-colors touch-target ${
                notificationsEnabled
                  ? 'bg-[#FFD100]/20 text-[#FFD100]'
                  : 'bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#9CA3AF]'
              }`}
              aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            >
              {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            </button>
          )}

          <button
            onClick={toggleLargeText}
            className={`p-2.5 rounded-xl transition-colors touch-target ${
              largeText
                ? 'bg-[#FFD100] text-black'
                : 'bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#9CA3AF]'
            }`}
            aria-label="Toggle large text"
          >
            <Type size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
