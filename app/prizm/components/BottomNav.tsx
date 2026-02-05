'use client';

import { useState, useRef, useEffect } from 'react';
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
  Video,
  CheckSquare,
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
  { href: '/prizm/content', label: 'Content Tracking', icon: Video, color: 'text-purple-400' },
  { href: '/prizm/checklist', label: 'Checklist', icon: CheckSquare, color: 'text-green-400' },
  { href: '/prizm/deliverables', label: 'Deliverables', icon: FileBox, color: 'text-amber-400' },
  { href: '/prizm/notes', label: 'Notes', icon: StickyNote, color: 'text-cyan-400' },
  { href: '/prizm/timer', label: 'Timer', icon: Timer, color: 'text-red-400' },
  { href: '/prizm/print', label: 'Print', icon: Printer, color: 'text-zinc-400' },
  { href: '/prizm/admin', label: 'Admin', icon: Settings, color: 'text-zinc-400' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { getTodayClipCount } = useAppStore();

  useEffect(() => {
    setMounted(true);
  }, []);

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
          className="fixed bottom-20 right-4 left-4 z-50 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-w-md mx-auto"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="font-medium text-white">More Tools</span>
            <button
              onClick={() => setShowMore(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1 p-2">
            {moreItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-[#FFD100]/10 text-[#FFD100]'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Icon
                    size={24}
                    strokeWidth={active ? 2.5 : 2}
                    className={active ? 'text-[#FFD100]' : item.color}
                  />
                  <span className="text-xs mt-1.5 text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0D] border-t border-[#2A2A2A] safe-area-pb">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const showBadge = 'showBadge' in item && item.showBadge && todayClipCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center w-full h-full px-2 transition-colors ${
                  active
                    ? 'text-[#FFD100]'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon
                    size={24}
                    strokeWidth={active ? 2.5 : 2}
                    className={active ? 'drop-shadow-[0_0_8px_rgba(255,209,0,0.5)]' : ''}
                  />
                  {showBadge && (
                    <div className="absolute -top-1 -right-2 bg-[#3B82F6] text-white text-[9px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">
                      {todayClipCount > 99 ? '99+' : todayClipCount}
                    </div>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${active ? 'text-[#FFD100]' : ''}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute bottom-0 w-12 h-0.5 bg-[#FFD100] rounded-full" />
                )}
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center w-full h-full px-2 transition-colors ${
              showMore || isMoreActive
                ? 'text-[#FFD100]'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <MoreHorizontal
              size={24}
              strokeWidth={showMore || isMoreActive ? 2.5 : 2}
              className={showMore || isMoreActive ? 'drop-shadow-[0_0_8px_rgba(255,209,0,0.5)]' : ''}
            />
            <span className={`text-xs mt-1 font-medium ${showMore || isMoreActive ? 'text-[#FFD100]' : ''}`}>
              More
            </span>
            {isMoreActive && !showMore && (
              <div className="absolute bottom-0 w-12 h-0.5 bg-[#FFD100] rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
