'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '../lib/constants';
import { cn } from '../lib/utils';

export default function SideNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn('w-52 shrink-0 border-r border-[#2A2A2A] min-h-[calc(100vh-3.75rem)]', className)}>
      <div className="py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-[#FFD100]/10 text-[#FFD100]'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[#1A1A1A]'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
