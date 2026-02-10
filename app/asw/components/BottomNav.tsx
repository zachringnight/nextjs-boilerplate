'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Calendar, Radio, User, MoreHorizontal, MessageSquare, ClipboardCheck, FileBox, X, ArrowLeft } from 'lucide-react';
import { useASWStore } from '../store';
import { useMounted } from '../hooks/useMounted';
import type { ViewMode } from '../types';

const navItems: { mode: ViewMode; label: string; icon: typeof Zap }[] = [
  { mode: 'now', label: 'Live', icon: Zap },
  { mode: 'schedule', label: 'Schedule', icon: Calendar },
  { mode: 'station', label: 'Station', icon: Radio },
  { mode: 'players', label: 'Players', icon: User },
];

const moreItems = [
  { href: '/asw/notes', label: 'Notes & Issues', icon: MessageSquare, color: 'text-blue-400' },
  { href: '/asw/checklist', label: 'Station Checklist', icon: ClipboardCheck, color: 'text-green-400' },
  { href: '/asw/deliverables', label: 'Deliverables', icon: FileBox, color: 'text-amber-400' },
];

export default function BottomNav() {
  const { viewMode, setViewMode } = useASWStore();
  const mounted = useMounted();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  if (!mounted) return null;

  // Check if we're on a sub-page (not the main /asw page)
  const isSubPage = pathname !== '/asw';

  return (
    <>
      {/* More Menu Overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-2xl max-w-lg mx-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
                <span className="text-sm font-semibold text-[#9CA3AF]">More Tools</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="text-[#6B7280] hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-[#FFD100]/10 text-[#FFD100]'
                          : 'hover:bg-[#2A2A2A] text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#FFD100]' : item.color}`} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[#2A2A2A] safe-area-pb">
        <div className="h-px bg-gradient-to-r from-transparent via-[#FFD100]/20 to-transparent" />
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {isSubPage ? (
            // Sub-page mode: show back button + current page name + more
            <>
              <Link
                href="/asw"
                className="relative flex flex-col items-center justify-center w-full h-full px-2 text-[#6B7280] hover:text-white transition-all"
              >
                <ArrowLeft size={22} strokeWidth={1.75} />
                <span className="text-[10px] mt-1 font-semibold tracking-wide">Back</span>
              </Link>
              {navItems.slice(0, 3).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.mode}
                    href="/asw"
                    onClick={() => setViewMode(item.mode)}
                    className="relative flex flex-col items-center justify-center w-full h-full px-2 text-[#6B7280] hover:text-white transition-all"
                  >
                    <Icon size={22} strokeWidth={1.75} />
                    <span className="text-[10px] mt-1 font-semibold tracking-wide">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`relative flex flex-col items-center justify-center w-full h-full px-2 transition-all ${
                  moreOpen ? 'text-[#FFD100]' : 'text-[#6B7280] hover:text-white'
                }`}
              >
                <MoreHorizontal size={22} strokeWidth={moreOpen ? 2.5 : 1.75} />
                <span className="text-[10px] mt-1 font-semibold tracking-wide">More</span>
              </button>
            </>
          ) : (
            // Main page mode: show view mode tabs + more
            <>
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
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`relative flex flex-col items-center justify-center w-full h-full px-2 transition-all ${
                  moreOpen ? 'text-[#FFD100]' : 'text-[#6B7280] hover:text-white active:text-white'
                }`}
              >
                <MoreHorizontal
                  size={22}
                  strokeWidth={moreOpen ? 2.5 : 1.75}
                  className={moreOpen ? 'drop-shadow-[0_0_8px_rgba(255,209,0,0.5)]' : ''}
                />
                <span className={`text-[10px] mt-1 font-semibold tracking-wide ${moreOpen ? 'text-[#FFD100]' : ''}`}>
                  More
                </span>
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
