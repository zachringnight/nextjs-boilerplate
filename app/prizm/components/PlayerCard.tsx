'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Player, ScheduleSlot } from '../types';
import { useAppStore } from '../store';
import PlayerPhoto from './PlayerPhoto';

const TIER_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-[#FFD100]/20', text: 'text-[#FFD100]', label: 'T1' },
  2: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'T2' },
  3: { bg: 'bg-[#9CA3AF]/20', text: 'text-[#9CA3AF]', label: 'T3' },
  4: { bg: 'bg-[#4B5563]/20', text: 'text-[#6B7280]', label: 'T4' },
};

interface PlayerCardProps {
  player: Player;
  nextSlot?: ScheduleSlot | null;
  showNextAppearance?: boolean;
}

export default function PlayerCard({ player, nextSlot, showNextAppearance = true }: PlayerCardProps) {
  const { largeText } = useAppStore();
  const tierStyle = player.tier ? TIER_STYLES[player.tier] : null;

  return (
    <Link href={`/prizm/players/${player.id}`} className="group block">
      <div className="relative bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 transition-all duration-200 hover:border-[#FFD100]/50 hover:bg-[#1E1E1E] hover:shadow-lg hover:shadow-[#FFD100]/5 active:scale-[0.98]">
        <div className="flex items-center gap-3">
          <PlayerPhoto src={player.photo} name={player.name} size="md" />

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className={`font-semibold text-white truncate group-hover:text-[#FFD100] transition-colors ${largeText ? 'text-lg' : 'text-base'}`}>
                {player.name}
              </p>
              {tierStyle && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${tierStyle.bg} ${tierStyle.text}`}>
                  {tierStyle.label}
                </span>
              )}
            </div>
            <p className={`text-[#9CA3AF] truncate ${largeText ? 'text-base' : 'text-sm'}`}>
              {player.team}
            </p>
            <p className={`text-[#FFD100] ${largeText ? 'text-base' : 'text-sm'}`}>
              {player.position}
            </p>
          </div>

          <ChevronRight size={18} className="text-[#4B5563] group-hover:text-[#FFD100] transition-all duration-200 group-hover:translate-x-0.5 flex-shrink-0" />
        </div>

        {/* Next Appearance */}
        {showNextAppearance && nextSlot && (
          <div className={`mt-3 pt-3 border-t border-[#2A2A2A] ${largeText ? 'text-base' : 'text-sm'}`}>
            <span className="text-[#9CA3AF]">Next: </span>
            <span className="text-white">{nextSlot.startTime}</span>
            <span className="text-[#9CA3AF]"> • </span>
            <span className="text-[#FFD100] capitalize">{nextSlot.station.replace(/([A-Z])/g, ' $1').trim()}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
