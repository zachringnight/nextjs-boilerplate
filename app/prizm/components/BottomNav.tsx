'use client';

import { useState, useRef, useEffect } from 'react';
import { useMounted } from '../hooks/useMounted';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../store';
import {
  Radio,
  Calendar,
  Layers,
  Users,
  MoreHorizontal,
  Clapperboard,
  ClipboardCheck,
  FileBox,
  StickyNote,
  Timer,
  Printer,
  Settings,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/prizm', label: 'Home', icon: Radio },
  { href: '/prizm/schedule', label: 'Schedule', icon: Calendar },
  { href: '/prizm/players', label: 'Players', icon: Users },
  { href: '/prizm/clips', label: 'Clips', icon: Clapperboard, showBadge: true },
];

const moreItems = [
  { href: '/prizm/stations', label: 'Stations', icon: Layers, color: 'text-blue-400' },
  { href: '/prizm/station-checklist', label: 'Station Check', icon: ClipboardCheck, color: 'text-yellow-400' },
  { href: '/prizm/deliverables', label: 'Deliverables', icon: FileBox, color: 'text-amber-400' },
  { href: '/prizm/notes', label: 'Notes', icon: StickyNote, color: 'text-cyan-400' },
  { href: '/prizm/timer', label: 'Timer', icon: Timer, color: 'text-red-400' },
  { href: '/prizm/print', label: 'Print', icon: Printer, color: 'text-zinc-400' },
  { href: '/prizm/admin', label: 'Admin', icon: Settings, color: 'text-zinc-400' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const mounted = useMounted();
  const menuRef = useRef<HTMLDivElement>(null);
  const { getTodayClipCount } = useAppStore();

  const todayClipCount = mounted ? getTodayClipCount() : 0;

  const isActive = (href: string) => {
    if (href === '/prizm') {
      return pathname === '/prizm' || pathname === '/prizm/now';
    }
    return pathname.startsWith(href);
  };

  const isMoreActive = moreItems.some((item) => pathname.startsWith(item.href));

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };

    if (showMore) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMore]);

  // Close menu on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: close menu when route changes
    setShowMore(false);
  }, [pathname]);

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setShowMore(false)} />
      )}

      {/* More Menu */}
      {showMore && (
        <div
          ref={menuRef}
          className="fixed bottom-20 right-4 left-4 z-50 glass border border-[#2A2A2A] rounded-2xl overflow-hidden max-w-md mx-auto animate-appear"
          style={{ boxShadow: 'var(--shadow-modal)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
            <span className="font-semibold text-white tracking-tight">More Tools</span>
            <button
              onClick={() => setShowMore(false)}
              className="p-1 text-[#6B7280] hover:text-white rounded-lg hover:bg-[#2A2A2A] transition-colors touch-target"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 p-3">
            {moreItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all touch-target ${
                    active
                      ? 'bg-[#FFD100]/10 text-[#FFD100]'
                      : 'text-[#6B7280] hover:bg-[#1A1A1A] hover:text-white active:bg-[#2A2A2A]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${
                    active ? 'bg-[#FFD100]/15' : 'bg-[#1A1A1A]'
                  }`}>
                    <Icon
                      size={20}
                      strokeWidth={active ? 2.5 : 1.75}
                      className={active ? 'text-[#FFD100]' : item.color}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight tracking-wide">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[#2A2A2A] safe-area-pb">
        {/* Top accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#FFD100]/20 to-transparent" />
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const showBadge = 'showBadge' in item && item.showBadge && todayClipCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center w-full h-full px-2 transition-all ${
                  active
                    ? 'text-[#FFD100]'
                    : 'text-[#6B7280] hover:text-white active:text-white'
                }`}
              >
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.75}
                    className={active ? 'drop-shadow-[0_0_8px_rgba(255,209,0,0.5)]' : ''}
                  />
                  {showBadge && (
                    <div className="absolute -top-1.5 -right-2.5 bg-[#3B82F6] text-white text-[9px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-lg">
                      {todayClipCount > 99 ? '99+' : todayClipCount}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-semibold tracking-wide ${active ? 'text-[#FFD100]' : ''}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute bottom-1 w-8 h-[3px] rounded-full gold-gradient" />
                )}
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`relative flex flex-col items-center justify-center w-full h-full px-2 transition-all ${
              showMore || isMoreActive
                ? 'text-[#FFD100]'
                : 'text-[#6B7280] hover:text-white active:text-white'
            }`}
          >
            <MoreHorizontal
              size={22}
              strokeWidth={showMore || isMoreActive ? 2.5 : 1.75}
              className={showMore || isMoreActive ? 'drop-shadow-[0_0_8px_rgba(255,209,0,0.5)]' : ''}
            />
            <span className={`text-[10px] mt-1 font-semibold tracking-wide ${showMore || isMoreActive ? 'text-[#FFD100]' : ''}`}>
              More
            </span>
            {isMoreActive && !showMore && (
              <div className="absolute bottom-1 w-8 h-[3px] rounded-full gold-gradient" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
