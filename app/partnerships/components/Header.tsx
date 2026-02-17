'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-[#2A2A2A]">
      <div className="h-1 gold-gradient" />
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        <Link href="/partnerships" className="flex items-center gap-2">
          <span className="text-[#FFD100] font-bold text-lg tracking-tight">PANINI</span>
          <span className="text-white/60 text-sm font-medium">Partnerships</span>
        </Link>
      </div>
    </header>
  );
}
