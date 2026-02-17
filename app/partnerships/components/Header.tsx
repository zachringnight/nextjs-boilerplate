'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-[#1F1F1F]">
      <div className="h-[2px] gold-gradient" />
      <div className="flex items-center justify-between px-4 md:px-6 h-14 max-w-7xl mx-auto">
        <Link href="/partnerships" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-[#FFD100] flex items-center justify-center">
            <span className="text-black font-black text-xs leading-none">P</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-white font-bold text-base tracking-tight group-hover:text-[#FFD100] transition-colors">Panini</span>
            <span className="text-[#6B7280] text-sm font-medium hidden sm:inline">Partnerships</span>
          </div>
        </Link>
        <Link
          href="/"
          className="text-[#6B7280] hover:text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-white/[0.04] transition-all"
        >
          All Apps
        </Link>
      </div>
    </header>
  );
}
