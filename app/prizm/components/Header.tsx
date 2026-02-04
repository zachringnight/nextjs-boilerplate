'use client';

import { Search, Type } from 'lucide-react';
import { useAppStore } from '../store';
import { formatTime12, getCurrentDayNumber, getEventStatus } from '../lib/time';
import { useEffect, useState } from 'react';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

export default function Header({ title = 'Prizm Lounge', showSearch = true }: HeaderProps) {
  const { largeText, toggleLargeText, setSearchOpen } = useAppStore();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setCurrentTime(formatTime12(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const dayNum = getCurrentDayNumber();
  const status = getEventStatus();

  const getStatusMessage = () => {
    switch (status) {
      case 'pre-show': return 'Pre-Show';
      case 'lunch': return 'Lunch Break';
      case 'wrapped': return "That's a Wrap!";
      case 'off-day': return 'Event Preview';
      default: return `Day ${dayNum} of 3`;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#2A2A2A]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-col">
          <h1 className={`font-bold text-white ${largeText ? 'text-2xl' : 'text-xl'}`}>
            {title}
          </h1>
          <div className={`flex items-center gap-2 text-[#9CA3AF] ${largeText ? 'text-base' : 'text-sm'}`}>
            {mounted && (
              <>
                <span>{currentTime}</span>
                <span>•</span>
                <span className={status === 'active' ? 'text-[#22c55e]' : ''}>
                  {getStatusMessage()}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors"
              aria-label="Search (Cmd+K)"
            >
              <Search size={20} className="text-[#9CA3AF]" />
            </button>
          )}

          <button
            onClick={toggleLargeText}
            className={`p-2 rounded-lg transition-colors ${
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
