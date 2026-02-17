'use client';

import Link from 'next/link';
import SportBadge from './SportBadge';
import { SPORT_ACCENT_COLORS } from '../lib/constants';
import type { Athlete } from '../types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AthleteCard({ athlete }: { athlete: Athlete }) {
  const location = [athlete.team_city, athlete.team_state].filter(Boolean).join(', ');
  const accentColor = athlete.sport ? SPORT_ACCENT_COLORS[athlete.sport] ?? '#6B7280' : '#6B7280';

  return (
    <Link
      href={`/partnerships/athletes/${athlete.id}`}
      className="group block relative overflow-hidden bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#FFD100]/30 hover:shadow-[0_0_20px_rgba(255,209,0,0.06)] transition-all"
    >
      <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: accentColor }} />
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
          style={{ background: `${accentColor}20`, color: accentColor }}
        >
          {getInitials(athlete.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate group-hover:text-[#FFD100] transition-colors">
            {athlete.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {athlete.sport && <SportBadge sport={athlete.sport} />}
            {athlete.league && (
              <span className="text-[#6B7280] text-xs">{athlete.league}</span>
            )}
          </div>
          {athlete.team && (
            <p className="text-[#9CA3AF] text-xs mt-1.5 truncate">{athlete.team}</p>
          )}
          {location && (
            <p className="text-[#6B7280] text-xs mt-0.5 truncate">{location}</p>
          )}
        </div>
        <span className="text-[#4B5563] group-hover:text-[#9CA3AF] transition-colors text-sm mt-1">&rarr;</span>
      </div>
      {(athlete.instagram_handle || athlete.x_handle) && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#2A2A2A]/60">
          {athlete.instagram_handle && (
            <span
              className="text-[#6B7280] hover:text-[#E1306C] text-xs truncate transition-colors"
              onClick={(e) => {
                e.preventDefault();
                window.open(`https://instagram.com/${athlete.instagram_handle}`, '_blank');
              }}
            >
              <svg className="inline-block w-3.5 h-3.5 mr-1 -mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              @{athlete.instagram_handle}
            </span>
          )}
          {athlete.x_handle && (
            <span
              className="text-[#6B7280] hover:text-white text-xs truncate transition-colors"
              onClick={(e) => {
                e.preventDefault();
                window.open(`https://x.com/${athlete.x_handle}`, '_blank');
              }}
            >
              <svg className="inline-block w-3.5 h-3.5 mr-1 -mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              @{athlete.x_handle}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
