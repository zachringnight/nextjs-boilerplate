'use client';

import Link from 'next/link';
import SportBadge from './SportBadge';
import type { Athlete } from '../types';

export default function AthleteCard({ athlete }: { athlete: Athlete }) {
  return (
    <Link
      href={`/partnerships/athletes/${athlete.id}`}
      className="block bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#FFD100]/30 transition-colors"
    >
      <h3 className="text-white font-semibold text-sm truncate">{athlete.name}</h3>
      <div className="flex items-center gap-2 mt-2">
        {athlete.sport && <SportBadge sport={athlete.sport} />}
      </div>
      {athlete.team && (
        <p className="text-[#6B7280] text-xs mt-2 truncate">{athlete.team}</p>
      )}
      {athlete.league && (
        <p className="text-[#6B7280] text-xs mt-0.5 truncate">{athlete.league}</p>
      )}
    </Link>
  );
}
