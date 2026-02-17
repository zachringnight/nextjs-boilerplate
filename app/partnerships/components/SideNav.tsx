'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NavIcon from './NavIcon';
import { NAV_ITEMS } from '../lib/constants';
import { cn } from '../lib/utils';

export default function SideNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn('w-56 shrink-0 border-r border-[#1F1F1F] min-h-[calc(100vh-3.75rem)]', className)}>
      <div className="py-5 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-[#FFD100]/10 text-[#FFD100] shadow-[inset_0_0_0_1px_rgba(255,209,0,0.15)]'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/[0.04]'
              )}
            >
              <NavIcon name={item.icon} className={cn('shrink-0', active ? 'text-[#FFD100]' : 'text-[#6B7280]')} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
