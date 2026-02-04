'use client';

import Link from 'next/link';
import { Player, ScheduleSlot } from '../types';
import { formatStationId } from '../data/stations';
import { useAppStore } from '../store';

interface PlayerCardProps {
  player: Player;
  nextSlot?: ScheduleSlot | null;
  showNextAppearance?: boolean;
}

export default function PlayerCard({ player, nextSlot, showNextAppearance = true }: PlayerCardProps) {
  const { largeText } = useAppStore();

  return (
    <Link href={`/prizm/players/${player.id}`}>
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 hover:border-[#FFD100]/50 transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          {/* Player Photo */}
          <div className="w-14 h-14 rounded-full bg-[#2A2A2A] flex items-center justify-center text-xl font-bold text-white overflow-hidden flex-shrink-0">
            {player.photo ? (
              <img
                src={player.photo}
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = player.name.charAt(0);
                }}
              />
            ) : (
              player.name.charAt(0)
            )}
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-white truncate ${largeText ? 'text-lg' : 'text-base'}`}>
              {player.name}
            </p>
            <p className={`text-[#9CA3AF] truncate ${largeText ? 'text-base' : 'text-sm'}`}>
              {player.team}
            </p>
            <p className={`text-[#FFD100] ${largeText ? 'text-base' : 'text-sm'}`}>
              {player.position}
            </p>
          </div>
        </div>

        {/* Next Appearance */}
        {showNextAppearance && nextSlot && (
          <div className={`mt-3 pt-3 border-t border-[#2A2A2A] ${largeText ? 'text-base' : 'text-sm'}`}>
            <span className="text-[#9CA3AF]">Next: </span>
            <span className="text-white">{nextSlot.startTime}</span>
            <span className="text-[#9CA3AF]"> • </span>
            <span className="text-[#FFD100] capitalize">{formatStationId(nextSlot.station)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
