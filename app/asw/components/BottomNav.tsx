'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Calendar, Radio, User, MoreHorizontal, MessageSquare, ClipboardCheck, FileBox, Timer, Clapperboard, X, ArrowLeft } from 'lucide-react';
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
  { href: '/asw/timer', label: 'Timer', icon: Timer, color: 'text-pink-400' },
  { href: '/asw/clips', label: 'Clip Markers', icon: Clapperboard, color: 'text-yellow-400' },
  { href: '/asw/notes', label: 'Notes & Issues', icon: MessageSquare, color: 'text-blue-400' },
  { href: '/asw/checklist', label: 'Station Checklist', icon: ClipboardCheck, color: 'text-green-400' },
  { href: '/asw/deliverables', label: 'Deliverables', icon: FileBox, color: 'text-amber-400' },
];

export default function BottomNav() {
  const { viewMode, setViewMode } = useASWStore();
  const mounted = useMounted();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonMainRef = useRef<HTMLButtonElement>(null);
  const moreButtonSubRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Check if we're on a sub-page (not the main /asw page)
  const isSubPage = pathname !== '/asw';

  // Handle keyboard navigation and focus management
  useEffect(() => {
    if (!moreOpen) return;

    // Focus the close button when menu opens
    closeButtonRef.current?.focus();

    // Handle Escape key to close menu
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        // Focus the appropriate More button based on current page
        const buttonToFocus = isSubPage ? moreButtonSubRef : moreButtonMainRef;
        buttonToFocus.current?.focus();
      }
    };

    // Trap focus within the menu
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, a, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift+Tab: if on first element, go to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
    };
  }, [moreOpen, isSubPage]);

  if (!mounted) return null;

  const handleCloseMenu = () => {
    setMoreOpen(false);
    // Focus the appropriate More button based on current page
    const buttonToFocus = isSubPage ? moreButtonSubRef : moreButtonMainRef;
    buttonToFocus.current?.focus();
  };

  return (
    <>
      {/* More Menu Overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseMenu}
            aria-hidden="true"
          />
          <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2" role="dialog" aria-modal="true" aria-label="More tools menu">
            <div ref={modalRef} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-2xl max-w-lg mx-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
                <span className="text-sm font-semibold text-[#9CA3AF]">More Tools</span>
                <button
                  ref={closeButtonRef}
                  onClick={handleCloseMenu}
                  className="text-[#6B7280] hover:text-white p-1"
                  aria-label="Close menu"
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
                      onClick={handleCloseMenu}
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
                    onClick={(e) => {
                      // Update view mode synchronously before navigation
                      setViewMode(item.mode);
                    }}
                    className="relative flex flex-col items-center justify-center w-full h-full px-2 text-[#6B7280] hover:text-white transition-all"
                    aria-label={`Navigate to ${item.label}`}
                  >
                    <Icon size={22} strokeWidth={1.75} />
                    <span className="text-[10px] mt-1 font-semibold tracking-wide">{item.label}</span>
                  </Link>
                );
              })}
              <button
                ref={moreButtonSubRef}
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className={`relative flex flex-col items-center justify-center w-full h-full px-2 transition-all ${
                  moreOpen ? 'text-[#FFD100]' : 'text-[#6B7280] hover:text-white'
                }`}
                aria-expanded={moreOpen}
                aria-label="More tools menu"
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
                ref={moreButtonMainRef}
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className={`relative flex flex-col items-center justify-center w-full h-full px-2 transition-all ${
                  moreOpen ? 'text-[#FFD100]' : 'text-[#6B7280] hover:text-white active:text-white'
                }`}
                aria-expanded={moreOpen}
                aria-label="More tools menu"
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
