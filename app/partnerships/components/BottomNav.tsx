'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NavIcon from './NavIcon';
import { NAV_ITEMS } from '../lib/constants';
import { cn } from '../lib/utils';
import { useMounted } from '../hooks/useMounted';

const primaryItems = NAV_ITEMS.slice(0, 4);
const moreItems = NAV_ITEMS.slice(4);

export default function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const mounted = useMounted();
  const [moreOpen, setMoreOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    closeRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        moreRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [moreOpen]);

  if (!mounted) return null;

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2" role="dialog" aria-modal="true" aria-label="More pages">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-2xl max-w-lg mx-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
                <span className="text-sm font-semibold text-[#9CA3AF]">More Pages</span>
                <button
                  ref={closeRef}
                  onClick={() => { setMoreOpen(false); moreRef.current?.focus(); }}
                  className="text-[#6B7280] hover:text-white p-1"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              <div className="p-2">
                {moreItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                        active ? 'bg-[#FFD100]/10 text-[#FFD100]' : 'hover:bg-[#2A2A2A] text-white'
                      )}
                    >
                      <NavIcon name={item.icon} className={cn('shrink-0', active ? 'text-[#FFD100]' : 'text-[#6B7280]')} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className={cn('fixed bottom-0 left-0 right-0 z-50 glass border-t border-[#2A2A2A] safe-area-pb', className)}>
        <div className="h-px bg-gradient-to-r from-transparent via-[#FFD100]/20 to-transparent" />
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {primaryItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center w-full h-full px-2 transition-all',
                  active ? 'text-[#FFD100]' : 'text-[#6B7280] hover:text-white'
                )}
              >
                <NavIcon name={item.icon} className="mb-0.5" />
                <span className={cn('text-[10px] font-semibold tracking-wide', active && 'text-[#FFD100]')}>
                  {item.label}
                </span>
                {active && <div className="absolute bottom-1 w-8 h-[3px] rounded-full gold-gradient" />}
              </Link>
            );
          })}
          <button
            ref={moreRef}
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              'relative flex flex-col items-center justify-center w-full h-full px-2 transition-all',
              moreOpen ? 'text-[#FFD100]' : 'text-[#6B7280] hover:text-white'
            )}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            aria-label="More pages menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5">
              <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
            </svg>
            <span className="text-[10px] font-semibold tracking-wide">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
