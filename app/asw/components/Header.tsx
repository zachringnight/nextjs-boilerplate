'use client';

import { Search, Type } from 'lucide-react';
import { useASWStore } from '../store';
import { formatTime, formatDateShort, getEventStatus, getEventDay } from '../lib/schedule-utils';
import { EVENT_INFO } from '../lib/constants';
import { useEffect, useState } from 'react';
import { useMounted } from '../hooks/useMounted';

export default function Header() {
  const { largeText, toggleLargeText, setSearchOpen } = useASWStore();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const mounted = useMounted();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(formatTime(now));
      setCurrentDate(formatDateShort(now));

      const eventDay = getEventDay(now);
      const status = getEventStatus();
      switch (status) {
        case 'pre-show': setStatusMessage('Pre-Show'); break;
        case 'wrapped': setStatusMessage("That's a Wrap!"); break;
        case 'off-day': setStatusMessage('Event Preview'); break;
        default: setStatusMessage(`Day ${eventDay} of ${EVENT_INFO.totalDays}`); break;
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const status = getEventStatus();

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="h-[2px] gold-gradient" />
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-col">
          <h1 className={`font-bold text-white tracking-tight ${largeText ? 'text-2xl' : 'text-xl'}`}>
            <span className="text-[#FFD100]">PANINI</span> Prizm Lounge
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
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors touch-target"
            aria-label="Search (Cmd+K)"
          >
            <Search size={20} className="text-[#9CA3AF]" />
          </button>

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
