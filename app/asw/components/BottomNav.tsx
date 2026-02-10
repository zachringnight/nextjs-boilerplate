'use client';

import { Zap, Calendar, Radio, User } from 'lucide-react';
import { useASWStore } from '../store';
import { useMounted } from '../hooks/useMounted';
import type { ViewMode } from '../types';

const navItems: { mode: ViewMode; label: string; icon: typeof Zap }[] = [
  { mode: 'now', label: 'Live', icon: Zap },
  { mode: 'schedule', label: 'Schedule', icon: Calendar },
  { mode: 'station', label: 'Station', icon: Radio },
  { mode: 'players', label: 'Players', icon: User },
];

export default function BottomNav() {
  const { viewMode, setViewMode } = useASWStore();
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[#2A2A2A] safe-area-pb">
      <div className="h-px bg-gradient-to-r from-transparent via-[#FFD100]/20 to-transparent" />
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = viewMode === item.mode;
          const Icon = item.icon;

          return (
            <button
              key={item.mode}
              onClick={() => setViewMode(item.mode)}
              className={`relative flex flex-col items-center justify-center w-full h-full px-2 transition-all ${
                active
                  ? 'text-[#FFD100]'
                  : 'text-[#6B7280] hover:text-white active:text-white'
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.75}
                className={active ? 'drop-shadow-[0_0_8px_rgba(255,209,0,0.5)]' : ''}
              />
              <span className={`text-[10px] mt-1 font-semibold tracking-wide ${active ? 'text-[#FFD100]' : ''}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-8 h-[3px] rounded-full gold-gradient" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
