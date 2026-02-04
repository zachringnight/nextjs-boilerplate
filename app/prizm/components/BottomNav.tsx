'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radio, Calendar, Layers, Users, MessageSquare } from 'lucide-react';

const navItems = [
  { href: '/prizm', label: 'Now', icon: Radio },
  { href: '/prizm/schedule', label: 'Schedule', icon: Calendar },
  { href: '/prizm/stations', label: 'Stations', icon: Layers },
  { href: '/prizm/players', label: 'Players', icon: Users },
  { href: '/prizm/notes', label: 'Notes', icon: MessageSquare },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/prizm') {
      return pathname === '/prizm' || pathname === '/prizm/now';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0D] border-t border-[#2A2A2A] safe-area-pb">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full px-2 transition-colors ${
                active
                  ? 'text-[#FFD100]'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
                className={active ? 'drop-shadow-[0_0_8px_rgba(255,209,0,0.5)]' : ''}
              />
              <span className={`text-xs mt-1 font-medium ${active ? 'text-[#FFD100]' : ''}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 w-12 h-0.5 bg-[#FFD100] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
